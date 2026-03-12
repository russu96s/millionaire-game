const VERSION = '0.0.4';
const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

console.log(`[v${VERSION}] API Handler init`);

module.exports = async (req, res) => {
  console.log(`[v${VERSION}] ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log(`[v${VERSION}] GET - fetch latest`);
      const url = `${SUPABASE_URL}/rest/v1/question?order=id.desc&limit=1`;
      
      const r = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!r.ok) {
        const err = await r.text();
        console.error(`[v${VERSION}] DB error:`, r.status, err);
        return res.status(r.status).json({ error: 'DB: ' + err });
      }

      const data = await r.json();
      console.log(`[v${VERSION}] Found:`, data.length);
      
      if (!data || data.length === 0) {
        return res.json({ data: null });
      }

      return res.json({ data: data[0] });
    }

    if (req.method === 'POST') {
      console.log(`[v${VERSION}] POST - new Q`);
      const { question, A, B, C, D, correct } = req.body;
      
      console.log(`[v${VERSION}] Fields:`, { q: !!question, A: !!A, B: !!B, C: !!C, D: !!D, correct });

      if (!question || !A || !B || !C || !D || !correct) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const url = `${SUPABASE_URL}/rest/v1/question`;
      
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ question, A, B, C, D, correct })
      });

      if (!r.ok) {
        const err = await r.text();
        console.error(`[v${VERSION}] Save error:`, r.status, err);
        return res.status(r.status).json({ error: 'Save: ' + err });
      }

      const data = await r.json();
      console.log(`[v${VERSION}] Saved!`);
      
      return res.status(201).json({ 
        success: true, 
        data: data[0],
        message: 'Întrebare salvată!'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(`[v${VERSION}] CRASH:`, err.message, err.stack);
    res.status(500).json({ error: 'Error: ' + err.message });
  }
};
