import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config({ path: '../.env' });
console.log("CHECKING CONNECTION STRING:", process.env.ATLAS_URI);
const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

// log every request to the console
app.use((req, res, next) => {
  console.log('>', req.method, req.path);
  next();
});

// --- Change nothing above this line ---


// Connect to MongoDB
const client = new MongoClient(process.env.ATLAS_URI);
const conn = await client.connect();
const db = conn.db('app');

// Gen Ai initally gave me try catch and in class we we learnt that we don't need it because we already have error catch provided so it wouldn't run so i removed them. I also had to add the db to the events collections in order fot it to run.
app.get('/api/events', async (req, res, ) => {
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


// Gen AI originally gave me a try-catch, but we learned in class that it's not needed because error handling is already built-in.
// This GET route checks that the ID is valid and looks up the event by _id. If it doesn’t exist, it returns a 404.
app.get('/api/events/:id', async (req, res, ) => {
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

// Gen Ai initally gave me try catch and in class we we learnt that we don't need it because we already have error catch provided so it wouldn't run so i removed them. I also had to add the db to the events collections in order fot it to run.
app.delete('/api/events/:id', async (req, res, ) => {
  const eventId = req.params.id;

  // Validate the provided ObjectId
  if (!ObjectId.isValid(eventId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  // Attempt to delete the event
  const result = await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });

  // Check if an event was deleted
  if (result.deletedCount === 1) {
    res.status(200).json({ message: 'Event deleted successfully' });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Gen AI initially gave me a try-catch, but in class we learned error handling is already covered globally,
// so I removed it. This POST route creates a new event with all the required fields,
// and responds with the inserted event including its new _id.
app.post('/api/events', async (req, res) => {
  const { name, description, location, attendees, date, category } = req.body;

  const newEvent = {
    name,
    description,
    location,
    attendees,
    date,
    category,
  };

  const result = await db.collection('events').insertOne(newEvent);

  res.status(201).json({ _id: result.insertedId, ...newEvent });
});

// Gen AI gave me try-catch, but we removed it in class since our server handles errors globally. Gen Ai also did not give me an id new object
// This PUT route replaces the entire document. I also delete the _id from the request body
// to prevent MongoDB from throwing an error when replacing the document.
app.put('/api/events/:id', async (req, res, ) => {
  const id  = new ObjectId(req.params.id);
  const updatedEvent = req.body;

  // Remove _id from the updatedEvent object to avoid overwriting the ID
  delete updatedEvent._id;

  // Replace the entire document
  const result = await db.collection('events').replaceOne(
    { _id: new ObjectId(id) },
    updatedEvent
  );

  if (result.matchedCount === 0) {
    return res.status(404).end();
  }

  res.status(200).end();
});

// Originally included extra error handling, but I removed it based on class instructions.
// This PATCH route updates only the specified fields in the event. I made sure to use $set
// and validated that the _id matches an existing document before applying updates. I also had to make a new id gpt,disregared that step.

app.patch('/api/events/:id', async (req, res, ) => {
  const id  = new ObjectId(req.params.id);
  const updates = req.body;

  const result = await db.collection('events').updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.status(200).send();
});

// Gen AI initially gave me a try-catch block, and made it a patch restful api but  but we learned in class that error handling is already built-in and that rsvp is not done with patch but with post or delete.
// This POST route increments numberOfAttendees by 1. I included validation for the ObjectId format
// and a fallback response if the event isn't found.

app.post('/api/events/:id/rsvp', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID format' });
  }

  const objectId = new ObjectId(id);

  const result = await db.collection('events').updateOne(
    { _id: objectId },
    { $inc: { numberOfAttendees: 1 } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.status(200).json({ message: 'RSVP successful' });
});

// Cancel RSVP


// Gen AI initially gave me a try-catch block, and made it a patch rest api but  but we learned in class that error handling is already built-in and that rsvp is not done with patch but with post or delete.
// This POST route safely cancels an RSVP by decrementing numberOfAttendees by 1. It includes checks to ensure
// the ObjectId is valid, the event exists, and there are RSVPs to cancel before applying the update.

app.post('/api/events/:id/cancel-rsvp', async (req, res) => {
  const id  = new ObjectId(req.params.id);

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid event ID format' });
  }
  const event = await db.collection('events').findOne({ _id: new ObjectId(id) });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  await db.collection('events').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { numberOfAttendees: -1 } }
  );

  if (event.numberOfAttendees <= 0) {
    return res.status(400).json({ error: 'No RSVPs to cancel' });
  }

  res.sendStatus(204);
});


// --- Change nothing below this line ---

// 404 - not found
app.use((req, res, next) => {
  res.status(404).json({ message: 'resource ' + req.url + ' not found' });
});

// 500 - Any server error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send()
});

// start server on port
const server = app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}/`);
});
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`error: port ${port} is already in use!`, 'kill this server! (control + c)');
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});
