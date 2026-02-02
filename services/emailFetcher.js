import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';
import { handleAutoResponse } from './autoResponder.js';

dotenv.config();

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

                  if (messageId) {
                    const exists = await Complaint.findOne({
                      where: { message_id: messageId }
                    });
                    if (exists) return null;
                  }

                 const complaint = await Complaint.create({
  message_id: messageId,
  from: mail.from?.text || '',
  subject: mail.subject || '(No subject)',
  body: mail.text || mail.html || '',
  attachments: mail.attachments?.map(a => a.filename) || [],
  received_at: mail.date || new Date()
});

// 🧪 DEMO SEVERITY (temporary)
complaint.severity = 'Low';
await complaint.save();

// 🚀 AUTO RESPONSE
await handleAutoResponse(complaint);


                })
                .catch(console.error);

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
