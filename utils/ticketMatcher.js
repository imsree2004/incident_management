// utils/ticketMatcher.js

export function extractTicketNumber(subject) {
  if (!subject) return null;

  // Matches: INC-2026-000001
  const match = subject.match(/INC-\d{4}-\d{6}/);
  return match ? match[0] : null;
}
