// services/ticketIntakeService.js

import Ticket from "../models/Ticket.js";
import { extractTicketNumber } from "../utils/ticketMatcher.js";

/**
 * Decides whether to create a new ticket
 * or attach email to an existing ticket
 */
export async function decideTicketAction(email) {
  const ticketNumber = extractTicketNumber(email.subject);

  if (!ticketNumber) {
    return {
      action: "CREATE_NEW",
      reason: "No ticket reference found in subject"
    };
  }

  const existingTicket = await Ticket.findOne({
    where: { ticket_number: ticketNumber }
  });

  if (existingTicket) {
    return {
      action: "ATTACH_EXISTING",
      ticket: existingTicket,
      reason: "Ticket reference found in subject"
    };
  }

  return {
    action: "CREATE_NEW",
    reason: "Ticket reference not found in database"
  };
}
