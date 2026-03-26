import { NextRequest, NextResponse } from 'next/server';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'hello@tengerly.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    if (!BREVO_API_KEY) {
      console.error('[contact] BREVO_API_KEY not configured');
      return NextResponse.json({ error: 'Service email non configuré' }, { status: 500 });
    }

    const htmlContent = `
      <h2>Nouveau contact B2B</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="padding:6px 12px;font-weight:bold;color:#666;">Nom</td><td style="padding:6px 12px;">${esc(name)}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#666;">Email</td><td style="padding:6px 12px;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        ${phone ? `<tr><td style="padding:6px 12px;font-weight:bold;color:#666;">Téléphone</td><td style="padding:6px 12px;">${esc(phone)}</td></tr>` : ''}
        ${company ? `<tr><td style="padding:6px 12px;font-weight:bold;color:#666;">Établissement</td><td style="padding:6px 12px;">${esc(company)}</td></tr>` : ''}
      </table>
      <h3 style="margin-top:16px;">Message</h3>
      <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${esc(message)}</p>
    `;

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Tengerly B2B', email: 'noreply@tengerly.com' },
        to: [{ email: TO_EMAIL, name: 'Tengerly B2B' }],
        replyTo: { email, name },
        subject: `[B2B Contact] ${company || name} — Nouveau partenaire potentiel`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[contact] Brevo error:', err);
      return NextResponse.json({ error: 'Erreur envoi email' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] Error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
