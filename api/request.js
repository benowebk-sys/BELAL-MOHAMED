const MAX_CONTENT_LENGTH = 10_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.-]{7,30}$/;
const nodemailer = require('nodemailer');

const respond = (res, status, payload) => res.status(status).json(payload);

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, { error: 'Method not allowed.' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_CONTENT_LENGTH) {
    return respond(res, 413, { error: 'The request is too large.' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return respond(res, 415, { error: 'Send the request as JSON.' });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return respond(res, 400, { error: 'The request data is invalid.' });
  }

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return respond(res, 400, { error: 'The request data is invalid.' });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return respond(res, 400, { error: 'The request data is invalid.' });
  }

  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_CONTENT_LENGTH) {
    return respond(res, 413, { error: 'The request is too large.' });
  }

  if (body.website !== undefined && (typeof body.website !== 'string' || body.website.trim())) {
    return respond(res, 400, { error: 'The request could not be verified.' });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 100 || /[\r\n]/.test(name)) {
    return respond(res, 400, { error: 'Enter a valid name (up to 100 characters).' });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return respond(res, 400, { error: 'Enter a valid phone number.' });
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return respond(res, 400, { error: 'Enter a valid email address.' });
  }
  if (!message || message.length > 3000) {
    return respond(res, 400, { error: 'Add a message of up to 3000 characters.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  const recipient = process.env.REQUEST_TO_EMAIL || gmailUser;
  if (!gmailUser || !appPassword || !recipient) {
    console.error('Request form is missing Gmail SMTP environment configuration.');
    return respond(res, 500, { error: 'The request form is not configured yet. Please try again later.' });
  }

  const text = [
    'NEW PORTFOLIO INQUIRY',
    'Bilal Mohamed | Railway Technology',
    '',
    `FROM: ${name}`,
    `PHONE: ${phone}`,
    `EMAIL: ${email}`,
    '',
    'PROJECT DETAILS',
    message
  ].join('\n');

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const safePhoneLink = encodeURIComponent(phone.replace(/[^\d+]/g, ''));
  const receivedDate = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(new Date());
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>New portfolio inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f1ec;font-family:Arial,Helvetica,sans-serif;color:#18283b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">A new project inquiry has arrived through your portfolio.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f3f1ec;">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;border-collapse:separate;border-spacing:0;background-color:#ffffff;border:1px solid #e5e0d7;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:27px 32px;background-color:#0b1725;border-bottom:3px solid #dfc18a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="54" valign="middle">
                    <table role="presentation" width="42" height="42" cellspacing="0" cellpadding="0" border="0" style="width:42px;height:42px;border:1px solid #dfc18a;border-radius:9px;">
                      <tr><td align="center" valign="middle" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;letter-spacing:-2px;">B&nbsp;M</td></tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <div style="color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:1.4px;">BILAL MOHAMED</div>
                    <div style="padding-top:5px;color:#b9c4cf;font-size:10px;letter-spacing:1.2px;">RAILWAY TECHNOLOGY</div>
                  </td>
                  <td align="right" valign="middle" style="color:#dfc18a;font-size:9px;letter-spacing:1.3px;">PORTFOLIO<br>INQUIRY</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 10px;">
              <div style="color:#9a7135;font-size:10px;font-weight:bold;letter-spacing:1.8px;">NEW PROJECT REQUEST</div>
              <h1 style="margin:10px 0 0;color:#142538;font-family:Arial,Helvetica,sans-serif;font-size:29px;line-height:1.2;font-weight:600;letter-spacing:-.8px;">A new opportunity is here.</h1>
              <p style="margin:12px 0 0;color:#6d716f;font-size:14px;line-height:1.7;">Someone has reached out through your portfolio. Their details and message are below.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7e2d9;border-radius:9px;background-color:#f8f7f3;">
                <tr>
                  <td colspan="2" style="padding:15px 18px;border-bottom:1px solid #e7e2d9;color:#9a7135;font-size:9px;font-weight:bold;letter-spacing:1.5px;">CONTACT DETAILS</td>
                </tr>
                <tr>
                  <td width="100" style="padding:14px 18px 5px;color:#77766f;font-size:10px;letter-spacing:1px;">NAME</td>
                  <td style="padding:14px 18px 5px;color:#18283b;font-size:13px;font-weight:bold;">${safeName}</td>
                </tr>
                <tr>
                  <td width="100" style="padding:10px 18px;color:#77766f;font-size:10px;letter-spacing:1px;">EMAIL</td>
                  <td style="padding:10px 18px;color:#18283b;font-size:13px;word-break:break-word;"><a href="mailto:${safeEmail}" style="color:#80602f;text-decoration:underline;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td width="100" style="padding:5px 18px 15px;color:#77766f;font-size:10px;letter-spacing:1px;">PHONE</td>
                  <td style="padding:5px 18px 15px;color:#18283b;font-size:13px;"><a href="tel:${safePhoneLink}" style="color:#80602f;text-decoration:underline;">${safePhone}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 30px;">
              <div style="padding:0 0 10px;color:#9a7135;font-size:9px;font-weight:bold;letter-spacing:1.5px;">PROJECT DETAILS</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-left:3px solid #b78a49;background-color:#f8f7f3;">
                <tr><td style="padding:17px 18px;color:#293a49;font-size:14px;line-height:1.8;overflow-wrap:anywhere;">${safeMessage}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" bgcolor="#dfc18a" style="border-radius:999px;">
                    <a href="mailto:${safeEmail}" style="display:inline-block;padding:14px 25px;color:#0b1725;font-size:10px;font-weight:bold;letter-spacing:1.1px;text-decoration:none;">REPLY TO ${safeName.toUpperCase()} &nbsp; &#8599;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:17px 32px;border-top:1px solid #e7e2d9;background-color:#fbfaf8;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="color:#85847f;font-size:10px;line-height:1.6;">Sent securely from your portfolio contact form.<br>Received ${receivedDate}</td>
                  <td align="right" style="color:#9a7135;font-size:10px;font-weight:bold;letter-spacing:1px;">B&nbsp;M</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="padding:16px 10px 0;color:#96948e;font-size:10px;line-height:1.6;text-align:center;">This message was sent to you because a visitor submitted a request on your portfolio.</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: appPassword
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });

  try {
    await transporter.sendMail({
      from: {
        name: 'Portfolio Requests',
        address: gmailUser
      },
      to: recipient,
      replyTo: email,
      subject: `New portfolio inquiry from ${name}`,
      text,
      html
    });
  } catch {
    console.error('Gmail SMTP could not send a portfolio request.');
    return respond(res, 502, { error: 'The request could not be emailed. Please try again later.' });
  }

  return respond(res, 201, { ok: true });
};
