import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

// Check if the URI is actually loading
console.log("CHECKING CONNECTION STRING:", process.env.ATLAS_URI ? "FOUND" : "NOT FOUND");

const port = process.env.PORT || 8080;
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
  // If we can't connect, we stop the server because the routes won't work anyway
  process.exit(1);
}

// --- API Routes ---

// GET all events (with optional category/search)
app.get('/api/events', async (req, res) => {
  const { category, search } = req.query;
  const query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const events = await db.collection('events').find(query).toArray();
  res.status(200).json(events);
});

// GET single event by ID
app.get('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!ObjectId.isValid(eventId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
  if (event) {
    res.status(200).json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// DELETE an event
app.delete('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!ObjectId.isValid(eventId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  const result = await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });

  if (result.deletedCount === 1) {
    res.status(200).json({ message: 'Event deleted successfully' });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// POST a new event
app.post('/api/events', async (req, res) => {
  const { name, description, location, attendees, date, category } = req.body;

  const newEvent = {
    name,
    description,
    location,
    attendees,
    date,
    category,
    numberOfAttendees: 0 // Initialize to 0
  };

  const result = await db.collection('events').insertOne(newEvent);
  res.status(201).json({ _id: result.insertedId, ...newEvent });
});

// PUT (Replace) an event
app.put('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  const id = new ObjectId(req.params.id);
  const updatedEvent = req.body;
  delete updatedEvent._id; // Ensure we don't try to overwrite the immutable _id field

  const result = await db.collection('events').replaceOne({ _id: id }, updatedEvent);

  if (result.matchedCount === 0) {
    return res.status(404).end();
  }
  res.status(200).end();
});

// PATCH (Update) an event
app.patch('/api/events/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const id = new ObjectId(req.params.id);
  const updates = req.body;

  const result = await db.collection('events').updateOne(
    { _id: id },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.status(200).send();
});

// POST RSVP (Increment)
app.post('/api/events/:id/rsvp', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID format' });
  }

  const result = await db.collection('events').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { numberOfAttendees: 1 } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.status(200).json({ message: 'RSVP successful' });
});

// POST Cancel RSVP (Decrement)
app.post('/api/events/:id/cancel-rsvp', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID format' });
  }

  const event = await db.collection('events').findOne({ _id: new ObjectId(id) });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if ((event.numberOfAttendees || 0) <= 0) {
    return res.status(400).json({ error: 'No RSVPs to cancel' });
  }

  await db.collection('events').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { numberOfAttendees: -1 } }
  );

  res.sendStatus(204);
});

// --- Middleware ---

// 404 - not found
app.use((req, res, next) => {
  res.status(404).json({ message: 'resource ' + req.url + ' not found' });
});

// 500 - Any server error (Your global handler)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).send();
});

// Start server
const server = app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}/`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`error: port ${port} is already in use!`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});