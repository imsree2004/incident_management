import { detectIssueType } from '../utils/issueDetector.js';
import { autoResponseTemplates } from '../utils/autoResponseTemplates.js';
import { sendMail } from './mailer.js';

export async function handleAutoResponse(complaint) {
  console.log('➡ handleAutoResponse called');

  if (complaint.severity !== 'Low') {
    console.log('⛔ Not low severity');
    return;
  }

  if (complaint.autoResponseSent) {
    console.log('⛔ Already responded');
    return;
  }

  const issueType = detectIssueType(complaint.body);
  const template = autoResponseTemplates[issueType];

  if (!template) {
    console.log('❌ No template found for issue type');
    return;
  }

  await sendMail(
    complaint.from,
    template.subject,
    template.body
  );

  complaint.autoResponseSent = true;
  complaint.autoResponseType = 'TEMPLATE';
  complaint.status = 'Auto-Handled';

  await complaint.save();

  console.log('✅ Auto-response sent');
}

