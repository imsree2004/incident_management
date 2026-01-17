// controllers/emailTicketBridge.js

import Ticket from "../models/Ticket.js";
import { decideTicketAction } from "../services/ticketIntakeService.js";
import Complaint from "../models/Complaint.js";
/**
 * Called after an email is fetched & cleaned
 */
export async function processEmailForTicket(email) {
  const decision = await decideTicketAction(email);

  if (decision.action === "ATTACH_EXISTING") {
    await Complaint.update(
      { ticket_id: decision.ticket.id },
      { where: { id: email.id } }
    );
    console.log(
      `[Ticket Intake] Email ${email.id} attached to ${decision.ticket.ticket_number}`
    );

    return {
      status: "ATTACHED",
      ticket: decision.ticket
    };
  }

  // CREATE NEW TICKET
  const lastTicket = await Ticket.findOne({
    order: [["id", "DESC"]]
  });

  const nextId = lastTicket ? lastTicket.id + 1 : 1;
  const year = new Date().getFullYear();
  const ticketNumber = `INC-${year}-${String(nextId).padStart(6, "0")}`;

  const newTicket = await Ticket.create({
    ticket_number: ticketNumber,
    email_id: email.id,
    subject: email.subject,
    summary: email.cleaned_text
      ? email.cleaned_text.substring(0, 150)
      : email.subject
  });

  await Complaint.update(
    { ticket_id: newTicket.id },
    { where: { id: email.id } }
  );

  console.log(
    `[Ticket Intake] Email ${email.id} created new ticket ${ticketNumber}`
  );

  return {
    status: "CREATED",
    ticket: newTicket
  };
}
