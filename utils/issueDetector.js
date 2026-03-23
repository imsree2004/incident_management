export function detectIssueType(text = '') {
const t = text.toLowerCase();

if (t.includes('login')) return 'LOGIN_ISSUE';
if (t.includes('password')) return 'PASSWORD_RESET';
if (t.includes('profile')) return 'PROFILE_UPDATE';
if (t.includes('network') || t.includes('internet') || t.includes('connection')) return 'NETWORK_ISSUE';

return null;
}
