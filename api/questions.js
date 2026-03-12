const VERSION = '0.0.3';
const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

console.log(`[v${VERSION}] API Serverless Function started`);

async function handler(req, res) {
  console.log(`[v${VERSION}] Request: ${req.method} ${req.url}`);
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get latest question
      const url = `${SUPABASE_URL}/rest/v1/question?order=id.desc&limit=1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Supabase Error:', response.status, response.statusText);
        return res.status(500).json({ error: 'Eroare la obținerea datelor' });
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return res.json({ data: null, message: 'Nu sunt întrebări disponibile' });
      }

      return res.json({ data: data[0] });
    }

    if (req.method === 'POST') {
      // Add new question
      const { question, A, B, C, D, correct } = req.body;
      console.log(`[v${VERSION}] POST Data received:`, { question: !!question, A: !!A, B: !!B, C: !!C, D: !!D, correct });

      if (!question || !A || !B || !C || !D || !correct) {
        console.error(`[v${VERSION}] Missing fields in POST request`);
        return res.status(400).json({ error: 'Completează toate câmpurile' });
      }

      const url = `${SUPABASE_URL}/rest/v1/question`;
      console.log(`[v${VERSION}] Sending to Supabase: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          question,
          A,
          B,
          C,
          D,
          correct
        })
      });

      if (!response.ok) {
        console.error(`[v${VERSION}] Supabase Error:`, response.status, response.statusText);
        const errorText = await response.text();
        console.error(`[v${VERSION}] Error details:`, errorText);
        return res.status(500).json({ error: 'Ceva nu a mers! ' + errorText });
      }

      const data = await response.json();
      console.log(`[v${VERSION}] Data saved successfully:`, data);
      return res.status(201).json({ success: true, data: data[0], message: 'Întrebare salvată cu succes!' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(`[v${VERSION}] Server Error:`, err);
    res.status(500).json({ error: 'Eroare pe server: ' + err.message });
  }
}

export default handler;
