import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 10000;
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.ATLAS_URI);
let db;

try {
  const conn = await client.connect();
  db = conn.db('app'); 
  console.log("✅ Connected to MongoDB Atlas");
} catch (err) {
  console.error("❌ MongoDB Connection Error:", err.message);
  process.exit(1);
}

// --- API Routes ---

app.get('/api/events', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    const events = await db.collection('events').find(query).toArray();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
  event ? res.status(200).json(event) : res.status(404).send();
});

app.post('/api/events', async (req, res) => {
  const result = await db.collection('events').insertOne({ ...req.body, numberOfAttendees: 0 });
  res.status(201).json(result);
});

app.delete('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  await db.collection('events').deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).send();
});

app.patch('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
  res.status(200).send();
});

// Changed to a simpler sub-route to avoid index issues
app.post('/api/rsvp/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { numberOfAttendees: 1 } });
  res.status(200).send();
});

// --- FRONTEND SERVING ---

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// THE FIX: Use a Regex literal (no quotes) instead of a string.
// This bypasses the path-to-regexp library error entirely.
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});