export function generateTicketNumber(id) {
  const year = new Date().getFullYear();
  const padded = String(id).padStart(6, "0");
  return `INC-${year}-${padded}`;
}
