import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Supabase Configuration
const SUPABASE_URL = 'https://tqsvemcagstrdlqagesz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3ZlbWNhZ3N0cmRscWFnZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQwNzEsImV4cCI6MjA4ODkxMDA3MX0.o_cGQGxqx3GWfGASReM0PkiuFGRiLtf3uhlmAuxdd9Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// GET - Obține ultima întrebare
app.get('/api/questions/latest', async (req, res) => {
  try {
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

    res.json({ data: data[0] });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Eroare pe server' });
  }
});

// POST - Adaugă o nouă întrebare
app.post('/api/questions', async (req, res) => {
  try {
    const { question, A, B, C, D, correct } = req.body;

    // Validare
    if (!question || !A || !B || !C || !D || !correct) {
      return res.status(400).json({ error: 'Completează toate câmpurile' });
    }

    const { data, error } = await supabase
      .from('question')
      .insert([
        {
          question,
          A,
          B,
          C,
          D,
          correct
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: 'Ceva nu a mers!' });
    }

    res.status(201).json({ success: true, data: data[0], message: 'Întrebare salvată cu succes!' });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Eroare pe server' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/editor.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server rulează pe port ${PORT}`);
});
