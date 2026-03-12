const VERSION = '0.0.7';
const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

console.log(`[v${VERSION}] API loaded`);

exports.default = async (req, res) => {
  console.log(`[v${VERSION}] ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Latest question
    if (req.method === 'GET') {
      console.log(`[v${VERSION}] GET request`);
      
      const url = `${SUPABASE_URL}/rest/v1/game?order=id.desc&limit=1`;
      console.log(`[v${VERSION}] Calling: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      const text = await response.text();
      console.log(`[v${VERSION}] Supabase response: ${response.status} - ${text.substring(0, 100)}`);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `DB Error ${response.status}`,
          details: text 
        });
      }

      try {
        const data = JSON.parse(text);
        if (!data || data.length === 0) {
          return res.json({ data: null });
        }
        return res.json({ data: data[0] });
      } catch (e) {
        console.error(`[v${VERSION}] Parse error:`, e.message);
        return res.json({ data: null });
      }
    }

    // POST - New question
    if (req.method === 'POST') {
      console.log(`[v${VERSION}] POST request`);
      const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
      
      console.log(`[v${VERSION}] Fields OK:`, !!question && !!optionA && !!optionB && !!optionC && !!optionD && !!correctAnswer);

      if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const url = `${SUPABASE_URL}/rest/v1/game`;
      
      const payload = JSON.stringify({ question, optionA, optionB, optionC, optionD, correctAnswer });
      console.log(`[v${VERSION}] Payload size: ${payload.length} bytes`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: payload
      });

      const text = await response.text();
      console.log(`[v${VERSION}] POST response: ${response.status} - ${text.substring(0, 100)}`);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Save failed: ${response.status}`,
          details: text 
        });
      }

      try {
        const data = JSON.parse(text);
        return res.status(201).json({ 
          success: true, 
          data: data[0],
          message: 'Saved!'
        });
      } catch (e) {
        console.error(`[v${VERSION}] Parse error:`, e.message);
        return res.status(201).json({ success: true });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(`[v${VERSION}] ERROR:`, err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
