export function detectIssueType(text = '') {
  const t = text.toLowerCase();

  if (t.includes('login')) return 'LOGIN_ISSUE';
  if (t.includes('password')) return 'LOGIN_ISSUE';
  if (t.includes('profile')) return 'PROFILE_UPDATE';

  return null;
}