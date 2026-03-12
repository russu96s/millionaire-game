const VERSION = '0.0.5';
const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

console.log(`[v${VERSION}] Test endpoint loaded`);

exports.default = async (req, res) => {
  console.log(`[v${VERSION}] Test request`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Test 1: Verify API connectivity
    const test1 = {
      status: 'OK',
      message: 'Serverless function is working!',
      timestamp: new Date().toISOString()
    };

    // Test 2: Try to list tables
    const url = `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`;
    
    console.log(`[v${VERSION}] Checking Supabase...`);
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const text = await response.text();
    console.log(`[v${VERSION}] Supabase response: ${response.status}`);

    // Test 3: Check for question table specifically
    const tableUrl = `${SUPABASE_URL}/rest/v1/question?limit=0`;
    const tableResponse = await fetch(tableUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const tableText = await tableResponse.text();
    console.log(`[v${VERSION}] Question table check: ${tableResponse.status}`);

    res.json({
      version: VERSION,
      serverless: 'working',
      supabase: {
        connected: response.ok,
        status: response.status,
        tableFound: tableResponse.ok,
        tableStatus: tableResponse.status,
        error: tableResponse.ok ? 'none' : tableText.substring(0, 200)
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`[v${VERSION}] Test error:`, err.message);
    res.status(500).json({ 
      error: err.message,
      version: VERSION
    });
  }
};
