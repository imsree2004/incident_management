import { detectIssueType } from '../utils/issueDetector.js';
import { autoResponseTemplates } from '../utils/autoResponseTemplates.js';
import { handleAIResponse } from "./aiResponder.js";
import { sendMail } from './mailer.js';

export async function handleAutoResponse(complaint) {

  if (complaint.severity !== 'Low') return;
  if (complaint.autoResponseSent) return;

  const recipient = complaint.from;

  const issueType = detectIssueType(
    (complaint.subject || '') + ' ' + (complaint.body || '')
  );

  const template = autoResponseTemplates[issueType];

  if (template) {

    await sendMail(
      recipient,
      template.subject,
      template.body
    );

    complaint.autoResponseSent = true;
    complaint.autoResponseType = 'TEMPLATE';
    complaint.autoResponseTime = new Date();
    complaint.status = 'Auto-Handled';

    await complaint.save();

    console.log(
      `✅ Template response sent for complaint ${complaint.id}`
    );

    return;
  }

  await handleAIResponse(complaint);
}
