import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import Complaint from '../models/Complaint.js';

export function startEmailListener() {

  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: true,
  });

  // 🔹 When connection is ready
  imap.once('ready', () => {

    imap.openBox('INBOX', false, (err) => {
      if (err) {
        console.error('❌ Failed to open inbox:', err);
        return;
      }

      console.log('📡 Email listener started...');

      // 🔹 1️⃣ Fetch existing unread ONCE
      fetchUnread(imap);

      // 🔹 2️⃣ Listen for new mail
      imap.on('mail', () => {
        console.log('📩 New email detected!');
        fetchUnread(imap);
      });

    });

  });

  // 🔹 Error handling
  imap.on('error', (err) => {
    console.error('IMAP Error:', err);
  });

  // 🔹 Reconnect if closed
  imap.on('close', () => {
    console.log('IMAP connection closed. Reconnecting in 5s...');
    setTimeout(startEmailListener, 5000);
  });

  imap.connect();
}

function fetchUnread(imap) {

  console.log('🔍 Checking unread emails...');

  imap.search(['UNSEEN'], (err, results) => {
    if (err) {
      console.error('Search error:', err);
      return;
    }

    if (!results || results.length === 0) {
      console.log('No unread emails.');
      return;
    }

    const f = imap.fetch(results, { bodies: '', markSeen: true });

    f.on('message', (msg) => {

      msg.on('body', async (stream) => {

        try {
          const mail = await simpleParser(stream);

          const messageId = mail.messageId || null;
          const senderEmail = mail.from?.value?.[0]?.address || '';

          // 🔹 Deduplicate
          if (messageId) {
            const exists = await Complaint.findOne({
              where: { message_id: messageId }
            });
            if (exists) {
              console.log('⚠ Duplicate email skipped');
              return;
            }
          }

          await Complaint.create({
            processing_stage: "RAW",
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

          console.log('✅ Complaint inserted');

        } catch (err) {
          console.error("Email parse error:", err.message);
        }
      });

    });

    f.once('error', err => {
      console.error('Fetch error:', err);
    });

  });
}