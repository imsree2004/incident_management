import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';

dotenv.config();

/**
 * Fetch new emails from IMAP, parse, dedupe, and store in DB.
 * Responsibilities:
 * - Only fetch UNSEEN emails
 * - Deduplicate using message-id
 * - Extract attachments metadata
 * - Save into the Complaint table
 */
export const fetchEmails = async (req, res) => {
  const imapConfig = {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 993),
    tls: (process.env.EMAIL_TLS || 'true') === 'true',
    tlsOptions: { rejectUnauthorized: false }
  };

  const imap = new Imap(imapConfig);

  const waitForReady = () =>
    new Promise((resolve, reject) => {
      const ready = () => {
        cleanup();
        resolve();
      };
      const error = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        imap.removeListener('ready', ready);
        imap.removeListener('error', error);
      };
      imap.once('ready', ready);
      imap.once('error', error);
    });

  try {
    imap.connect();
    await waitForReady();

    // Open INBOX in read-write mode
    const openBox = () =>
      new Promise((resolve, reject) => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);
          resolve(box);
        });
      });

    await openBox();

    // Fetch only UNSEEN emails
    const results = await new Promise((resolve, reject) => {
      imap.search(['UNSEEN'], (err, uids) => {
        if (err) return reject(err);
        resolve(uids || []);
      });
    });

    if (!results.length) {
      imap.end();
      return res.json({ message: 'No new emails', count: 0 });
    }

    const fetchOptions = { bodies: '', markSeen: true };
    const f = imap.fetch(results, fetchOptions);

    const saved = [];
    const skipped = [];
    const parsePromises = [];

    f.on('message', (msg) => {
      let attributes = null;

      msg.on('attributes', (attrs) => {
        attributes = attrs;
      });

      msg.on('body', (stream) => {
        const p = simpleParser(stream)
          .then(async (mail) => {
            const messageId =
              mail.messageId ||
              mail.headers?.get('message-id') ||
              mail.headers?.get('Message-ID') ||
              null;

            // Deduplication
            if (messageId) {
              const exists = await Complaint.findOne({
                where: { message_id: messageId }
              });
              if (exists) {
                skipped.push({ messageId, reason: 'duplicate' });
                return null;
              }
            }

            const attachments = (mail.attachments || []).map((a) => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.size || null
            }));

            const emailData = {
              message_id: messageId,
              from: mail.from?.text || '',
              to: mail.to?.text || '',
              subject: mail.subject || '(No subject)',
              body: mail.text || mail.html || '',
              attachments,
              received_at: mail.date || new Date(),
              processed_meta: {
                raw: {
                  headers: Array.from(mail.headers || []),
                  textSnippet: (mail.text || '').slice(0, 300)
                }
              }
            };

            const created = await Complaint.create(emailData);
            saved.push({ id: created.id, messageId });

            return created;
          })
          .catch((err) => {
            console.error('Parse error:', err);
            return null;
          });

        parsePromises.push(p);
      });
    });

    f.once('error', (err) => {
      console.error('Fetch error:', err);
    });

    const endPromise = new Promise((resolve) => f.once('end', resolve));
    await endPromise;

    await Promise.all(parsePromises);

    imap.end();

    return res.json({
      message: 'Email fetch complete',
      savedCount: saved.length,
      skippedCount: skipped.length,
      saved,
      skipped
    });
  } catch (error) {
    console.error('fetchEmails error:', error);
    try {
      imap.end();
    } catch {}
    return res.status(500).json({
      error: 'Failed to fetch emails',
      details: error.message || String(error)
    });
  }
};
