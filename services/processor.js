import { Op } from "sequelize";
import Complaint from "../models/Complaint.js";
import Ticket from "../models/Ticket.js";
import { runNLP } from "./nlp/nlpService.js";
import { runML } from "./mlInferenceService.js";
import { routeTicket } from "./ticketRoutingService.js";
import { generateTicketNumber } from "../utils/ticketNumberGenerator.js";
import User from "../models/User.js";
import { handleAutoResponse } from './autoResponder.js';
/* ======================================================
   1️⃣ NLP WORKER
   Picks: processing_stage = RAW
   Sets:  processing_stage = NLP_DONE
====================================================== */
export const processNLP = async () => {
  try {
    const complaint = await Complaint.findOne({
      where: { processing_stage: "RAW" },
      order: [["received_at", "ASC"]]
    });

    if (!complaint) return;

    console.log("🧠 NLP processing complaint:", complaint.id);

    const nlpResult = runNLP(complaint.body);

    await complaint.update({
      processed_meta: {
        ...(complaint.processed_meta || {}),
        nlp: nlpResult
      },
      processing_stage: "NLP_DONE"
    });

    console.log("✅ NLP done:", complaint.id);

  } catch (err) {
    console.error("❌ NLP error:", err);
  }
};


/* ======================================================
   2️⃣ ML WORKER
   Picks: processing_stage = NLP_DONE
   Sets:  processing_stage = ML_DONE
====================================================== */
export const processML = async () => {
  try {
    const complaint = await Complaint.findOne({
      where: { processing_stage: "NLP_DONE" },
      order: [["received_at", "ASC"]]
    });

    if (!complaint) return;

    console.log("🤖 ML processing complaint:", complaint.id);

    const cleanedText =
      complaint.processed_meta?.nlp?.cleaned_text;

    if (!cleanedText) {
      console.log("⚠ No cleaned text found");
      return;
    }

    const mlResult = await runML(cleanedText);
    
        const rawSeverity = mlResult.severity?.toLowerCase();

let severity;

if (rawSeverity === "low") {
  severity = "Low";   // treat both as Low internally
} else {
  severity = "High";
}
    await complaint.update({
      severity,
      department: mlResult.department.toLowerCase(),
      department_confidence: mlResult.department_confidence,
      processed_meta: {
        ...(complaint.processed_meta || {}),
        ml: mlResult
      }
    });
    console.log("ML RAW SEVERITY:", mlResult.severity);
console.log("FINAL SEVERITY USED:", severity);
console.log("ML department:", mlResult.department);

    console.log("✅ ML done:", complaint.id);

    /* =========================================
       🔥 HANDLE LOW SEVERITY HERE
    ========================================= */
    if (severity === "Low") {
      console.log("📨 Low severity → Auto response:", complaint.id);

      await handleAutoResponse(complaint);

      await complaint.update({
        processing_stage: "DONE",
        processed_at: new Date()
      });

      return; // 🚨 IMPORTANT: stop here (no ticket)
    }

    /* =========================================
       🔥 HIGH SEVERITY → CONTINUE TO TICKET
    ========================================= */
    await complaint.update({
      processing_stage: "ML_DONE"
    });

  } catch (err) {
    console.error("❌ ML error:", err);
  }
};


/* ======================================================
   3️⃣ TICKET WORKER
   Picks: processing_stage = ML_DONE
   Sets:  processing_stage = TICKET_DONE
====================================================== */
export const processTickets = async () => {
  try {

    const complaint = await Complaint.findOne({
      where: { processing_stage: "ML_DONE" },
      order: [["received_at", "ASC"]]
    });

    if (!complaint) return;

    console.log("🎫 Creating ticket for complaint:", complaint.id);

    // Prevent duplicate tickets
    const existingTicket = await Ticket.findOne({
      where: { email_id: complaint.id }
    });

    if (existingTicket) {
      await complaint.update({
        processing_stage: "TICKET_DONE"
      });
      console.log("⚠ Ticket already exists for:", complaint.id);
      return;
    }

    const ticketNumber = generateTicketNumber(complaint.id);

    const newTicket = await Ticket.create({
  ticket_number: ticketNumber,
  email_id: complaint.id,
  subject: complaint.subject,
  summary: complaint.body?.substring(0, 200),

  severity: complaint.severity,
  department: complaint.department,
  confidence: complaint.department_confidence,

  status: "OPEN"
});

    await routeTicket(newTicket.id);

    await complaint.update({
      processing_stage: "TICKET_DONE",
      processed_at: new Date()
    });

    console.log("✅ Ticket created & routed:", complaint.id);

  } catch (err) {
    console.error("❌ Ticket error:", err);
  }
};