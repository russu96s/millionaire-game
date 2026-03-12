import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
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
      const { data, error } = await supabase
        .from('question')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ error: 'Eroare la obținerea datelor' });
      }

      if (!data || data.length === 0) {
        return res.json({ data: null, message: 'Nu sunt întrebări disponibile' });
      }

      return res.json({ data: data[0] });
    }

    if (req.method === 'POST') {
      // Add new question
      const { question, A, B, C, D, correct } = req.body;

      if (!question || !A || !B || !C || !D || !correct) {
        return res.status(400).json({ error: 'Completează toate câmpurile' });
      }

      const { data, error } = await supabase
        .from('question')
        .insert([{ question, A, B, C, D, correct }])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ error: 'Ceva nu a mers!' });
      }

      return res.status(201).json({ success: true, data: data[0], message: 'Întrebare salvată cu succes!' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Eroare pe server' });
  }
}
