import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

export async function routeTicket(ticketId) {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found for routing");
  }

  let department = ticket.department;

  // fallback
  if (!department || ticket.confidence < 0.6) {
    department = "General";
  }

  // ✅ get agents sorted by least load
  const agents = await User.findAll({
    where: { role: "agent", department },
    order: [["current_load", "ASC"]]
  });

  if (!agents.length) {
    throw new Error(`No agents found in DB for department: ${department}`);
  }

  // ✅ pick least loaded agent
  const selectedAgent = agents[0];

  // ✅ update load
  selectedAgent.current_load += 1;
  await selectedAgent.save();

  // ✅ assign ticket
  await ticket.update({
    department,
    assigned_to: selectedAgent.id,
    status: "IN_PROGRESS"
  });

  return {
    ticketId: ticket.id,
    department,
    assignedAgent: selectedAgent.id
  };
}