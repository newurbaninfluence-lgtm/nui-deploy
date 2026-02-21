// print-request.js — Netlify Function
// Receives client print request from /print page
// 1. Saves request to Supabase
// 2. Texts Faren instantly via OpenPhone
// Env vars: OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER, FAREN_PHONE, SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, phone, address, qty, notes, product, price, industry } = data;

    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Name and phone required' })
      };
    }

    const timestamp = new Date().toISOString();
    const requestId = 'PRINT-' + Date.now().toString(36).toUpperCase();

    // ── 1. Save to Supabase ──────────────────────────────────────────
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    let savedId = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const saveResp = await fetch(`${SUPABASE_URL}/rest/v1/print_requests`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            request_id: requestId,
            client_name: name,
            phone,
            address: address || '',
            qty_notes: qty || '',
            extra_notes: notes || '',
            product,
            price,
            industry: industry || 'general',
            status: 'new',
            created_at: timestamp
          })
        });

        if (saveResp.ok) {
          const [saved] = await saveResp.json();
          savedId = saved?.id;
        } else {
          // Table may not exist yet — non-fatal, still send the text
          console.warn('Supabase save failed (table may not exist):', await saveResp.text());
        }
      } catch (err) {
        console.warn('Supabase save error (non-fatal):', err.message);
      }
    }

    // ── 2. Text Faren via OpenPhone ──────────────────────────────────
    const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
    const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;
    const FAREN_PHONE = process.env.FAREN_PHONE; // Faren's personal cell

    if (!OPENPHONE_API_KEY || !FROM_NUMBER_ID || !FAREN_PHONE) {
      // Log and return success anyway — don't fail the client experience
      console.error('OpenPhone env vars missing: OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER, FAREN_PHONE');
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, requestId, warning: 'OpenPhone not configured' })
      };
    }

    const smsBody = [
      `🖨️ PRINT REQUEST — ${requestId}`,
      ``,
      `Product: ${product}`,
      `Price: ${price}`,
      ``,
      `Client: ${name}`,
      `Phone: ${phone}`,
      address ? `Ship to: ${address}` : null,
      qty ? `Qty/Size: ${qty}` : null,
      notes ? `Notes: ${notes}` : null,
      industry ? `Industry: ${industry}` : null,
      ``,
      `Reply to client or upload to Signs365 when ready.`
    ].filter(Boolean).join('\n');

    const smsResp = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': OPENPHONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: smsBody,
        to: [FAREN_PHONE],
        from: FROM_NUMBER_ID
      })
    });

    if (!smsResp.ok) {
      const errText = await smsResp.text();
      console.error('OpenPhone send failed:', errText);
      // Still return success to client — Supabase record is saved
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, requestId, warning: 'SMS failed but request logged' })
      };
    }

    const smsResult = await smsResp.json();

    // ── 3. Log outbound SMS to Supabase communications ───────────────
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      fetch(`${SUPABASE_URL}/rest/v1/communications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          channel: 'sms',
          direction: 'outbound',
          message: smsBody,
          metadata: {
            to: FAREN_PHONE,
            openphone_id: smsResult?.data?.id,
            print_request_id: requestId,
            product,
            client_name: name
          },
          created_at: timestamp
        })
      }).catch(err => console.warn('Comm log failed (non-fatal):', err.message));
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, requestId, messageId: smsResult?.data?.id })
    };

  } catch (err) {
    console.error('print-request error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Request failed' })
    };
  }
};
