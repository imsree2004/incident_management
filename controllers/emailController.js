import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';
dotenv.config();

export const fetchEmails = async (req, res) => {
  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: true,
  });

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: 'Failed to open inbox' });
      }

      imap.search(['ALL'], (err, results) => {
        if (err || results.length === 0) {
          imap.end();
          return res.json({ message: 'No emails found' });
        }

        const f = imap.fetch(results, { bodies: '' });
        const emails = [];
        const promises = [];

        f.on('message', (msg) => {
          msg.on('body', (stream) => {
            const p = simpleParser(stream).then(async (mail) => {
              const emailData = {
                from: mail.from?.text || '',
                subject: mail.subject || '(No subject)',
                body: mail.text || mail.html || '',
                attachments: mail.attachments?.map(a => a.filename) || [],
              };

              // Save to DB
              await Complaint.create(emailData);
              emails.push(emailData);
            }).catch(err => console.log('Parse error:', err));

            promises.push(p);
          });
        });

        f.once('error', (err) => {
          console.log('Fetch error:', err);
        });

        f.once('end', async () => {
          // Wait for all parsing and DB saves to complete
          await Promise.all(promises);
          imap.end();
          res.json({ count: emails.length, saved: true, emails });
        });
      });
    });
  });

  imap.once('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  imap.connect();
};
