import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Helpers for ESM (needed for serving static files) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the URI is actually loading
console.log("CHECKING CONNECTION STRING:", process.env.ATLAS_URI ? "FOUND" : "NOT FOUND");

const port = process.env.PORT || 10000; // Render usually uses 10000
const app = express();

app.use(cors());
app.use(express.json());

// Log every request to the console
app.use((req, res, next) => {
  console.log('>', req.method, req.path);
  next();
});

// --- MongoDB Connection Logic ---
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
  const { category, search } = req.query;
  const query = {};
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const events = await db.collection('events').find(query).toArray();
  res.status(200).json(events);
});

app.get('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!ObjectId.isValid(eventId)) return res.status(400).json({ error: 'Invalid ID' });

  const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
  event ? res.status(200).json(event) : res.status(404).json({ error: 'Event not found' });
});

app.delete('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!ObjectId.isValid(eventId)) return res.status(400).json({ error: 'Invalid ID' });

  const result = await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
  result.deletedCount === 1 ? res.status(200).json({ message: 'Deleted' }) : res.status(404).send();
});

app.post('/api/events', async (req, res) => {
  const { name, description, location, attendees, date, category } = req.body;
  const newEvent = { name, description, location, attendees, date, category, numberOfAttendees: 0 };
  const result = await db.collection('events').insertOne(newEvent);
  res.status(201).json({ _id: result.insertedId, ...newEvent });
});

app.put('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  const id = new ObjectId(req.params.id);
  const updatedEvent = req.body;
  delete updatedEvent._id;
  const result = await db.collection('events').replaceOne({ _id: id }, updatedEvent);
  result.matchedCount === 0 ? res.status(404).end() : res.status(200).end();
});

app.patch('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  const result = await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
  result.matchedCount === 0 ? res.status(404).json({ error: 'Not found' }) : res.status(200).send();
});

app.post('/api/events/:id/rsvp', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  const result = await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { numberOfAttendees: 1 } });
  res.status(200).json({ message: 'RSVP successful' });
});

app.post('/api/events/:id/cancel-rsvp', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).send();
  const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
  if (!event || (event.numberOfAttendees || 0) <= 0) return res.status(400).send();
  await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { numberOfAttendees: -1 } });
  res.sendStatus(204);
});

// --- SERVE FRONTEND ---

// 1. Tell Express to serve the static files from the 'client/dist' folder
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// 2. Handle any requests that don't match the API routes by sending the index.html
// This allows React Router to handle page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// --- ERROR HANDLING ---

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).send("Internal Server Error");
});

// Start server
const server = app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`error: port ${port} is already in use!`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});