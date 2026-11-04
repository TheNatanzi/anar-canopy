/* Anar Events inquiry inbox (owner 2026-11-03: "fix everything"). The website form posts here; this Worker emails the
   inquiry to the brand Gmail through Cloudflare Email Routing (send_email binding, wrangler.toml), From the site's own
   domain, with Reply-To set to the visitor, so a reply in Gmail goes straight to them. No third party sees the data.
   Answers JSON {success:true|false} to fetch (site.js), or redirects back to the page for a plain no-JS post. */
import { EmailMessage } from 'cloudflare:email';

const SITE = 'https://anarevents.com';
const ALLOWED = [SITE, 'https://www.anarevents.com'];
const FROM = 'website@anarevents.com';
const TO = 'anareventsllc@gmail.com';
const LIMITS = { names: 200, email: 254, phone: 60, message: 5000 };

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : SITE,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Vary': 'Origin'
});
const json = (body, status, origin) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) }
});
/* one header line: no CR / LF (header injection), trimmed and capped */
const clean = (v, max) => String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
/* RFC 2047 for non-ASCII header text (Persian names) */
const encodeHeader = (s) => /^[\x20-\x7e]*$/.test(s) ? s
  : '=?UTF-8?B?' + btoa(String.fromCharCode(...new TextEncoder().encode(s))) + '?=';
const b64Body = (s) => {
  const bytes = new TextEncoder().encode(s); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) { bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); }
  return btoa(bin).replace(/.{76}/g, '$&\r\n');
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
    if (request.method === 'OPTIONS') { return new Response(null, { status: 204, headers: cors(origin) }); }
    if (request.method !== 'POST') { return Response.redirect(SITE + '/#inquire', 302); }
    if (origin && !ALLOWED.includes(origin)) { return json({ success: false, message: 'origin' }, 403, origin); }

    let form;
    try { form = await request.formData(); } catch (e) { return json({ success: false, message: 'bad form' }, 400, origin); }
    const done = () => wantsJson ? json({ success: true }, 200, origin) : Response.redirect(SITE + '/?sent=1#inquire', 303);
    if (clean(form.get('_honey'), 10)) { return done(); }            // the spam trap: pretend it went out

    const names = clean(form.get('names'), LIMITS.names);
    const email = clean(form.get('email'), LIMITS.email);
    const phone = clean(form.get('phone'), LIMITS.phone);
    const message = String(form.get('message') || '').trim().slice(0, LIMITS.message);
    if (!names || !/^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/.test(email)) {
      return json({ success: false, message: 'name and a valid email are required' }, 422, origin);
    }

    const body = [
      'New inquiry from anarevents.com', '',
      'Name(s): ' + names,
      'Email:   ' + email,
      'Phone:   ' + (phone || '(not given)'), '',
      'Message:', message || '(no message)', '',
      '— Reply to this email to answer them directly.'
    ].join('\r\n');
    const raw = [
      'From: ' + encodeHeader('Anar Events website') + ' <' + FROM + '>',
      'To: <' + TO + '>',
      'Reply-To: <' + email + '>',
      'Subject: ' + encodeHeader('New inquiry: ' + names),
      'Message-ID: <' + crypto.randomUUID() + '@anarevents.com>',
      'Date: ' + new Date().toUTCString(),
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '', b64Body(body)
    ].join('\r\n');

    try {
      await env.MAIL.send(new EmailMessage(FROM, TO, raw));
    } catch (e) {
      console.error('send failed', e && e.message);
      return json({ success: false, message: 'send failed' }, 502, origin);
    }
    return done();
  }
};
