import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import Complaint from '../models/Complaint.js';
import { handleAutoResponse } from './autoResponder.js';

export const fetchEmailsInternal = async () => {
  return new Promise((resolve, reject) => {

    const imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      tls: true,
    });

    imap.once('ready', () => {

      imap.openBox('INBOX', false, (err) => {
        if (err) return reject(err);

        imap.search(['UNSEEN'], (err, results) => {
          if (err) return reject(err);

          if (!results || results.length === 0) {
            imap.end();
            return resolve('No new emails');
          }

          const f = imap.fetch(results, { bodies: '', markSeen: true });
          const promises = [];

          f.on('message', (msg) => {

            msg.on('body', (stream) => {

  const p = simpleParser(stream)
    .then(async (mail) => {

      const messageId = mail.messageId || null;
      const replyTo = mail.inReplyTo || null;
      const senderEmail = mail.from?.value?.[0]?.address || '';

      // 🔹 1️⃣ Deduplicate
      if (messageId) {
        const exists = await Complaint.findOne({
          where: { message_id: messageId }
        });
        if (exists) return;
      }

      // 🔹 2️⃣ Reply handling
      if (replyTo) {
        const parentComplaint = await Complaint.findOne({
          where: { message_id: replyTo }
        });

        if (parentComplaint) {

          parentComplaint.response_count += 1;

          if (parentComplaint.response_count >= 2) {
            parentComplaint.status = 'Escalated';
            parentComplaint.escalated = true;
            parentComplaint.escalated_at = new Date();
          }

          await parentComplaint.save();
          return;
        }
      }

      // 🔹 3️⃣ Create new complaint
      const complaint = await Complaint.create({
        processing_stage:"RAW",
        message_id: messageId,
        from: senderEmail,
        subject: mail.subject || '(No subject)',
        body: mail.text || mail.html || '',
        attachments: mail.attachments?.map(a => a.filename) || [],
        received_at: mail.date || new Date(),
        response_count: 0,
        escalated: false,
        status: 'New'
      });

      // 🔹 DEMO SEVERITY (Always Low)
     await complaint.save();


      // 🚀 Auto Response
    })
    .catch(err => {
      console.error("Email parse error:", err.message);
    });

  promises.push(p);
});


          });

          f.once('end', async () => {
            await Promise.all(promises);
            imap.end();
            resolve('Emails fetched successfully');
          });

        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
};
