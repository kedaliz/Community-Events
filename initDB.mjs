import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '.env' });

const client = new MongoClient(process.env.ATLAS_URI);

async function initDB() {
  try {
    await client.connect();
    const db = client.db('app');

    // Drop existing collection
    await db.collection('events').drop().catch(() => {});

    // Insert sample events
    const events = [
      {
        name: "Caribbean Welcome Mixer",
        dateTime: new Date("2024-09-06T18:00:00Z"),
        location: "Willard Straight Hall, Memorial Room",
        description: "A social event at the start of the semester to introduce new and returning Caribbean students to each other.",
        numberOfAttendees: 100,
        category: "Social",
        imageUri: "/images/welcomemixer.jpg"
      },
      {
        name: "Black & Caribbean Student Organization Fair",
        dateTime: new Date("2024-09-10T17:30:00Z"),
        location: "Africana Center Lawn",
        description: "A networking event where students can explore different Black and Caribbean student organizations on campus.",
        numberOfAttendees: 150,
        category: "Networking",
        imageUri: "/images/lawn.jpg"
      },
      {
        name: "Island Vibes Night",
        dateTime: new Date("2024-09-15T20:00:00Z"),
        location: "Appel Commons Multipurpose Room",
        description: "A cultural party featuring Caribbean music (dancehall, soca, reggae, kompa, zouk), food, and games.",
        numberOfAttendees: 200,
        category: "Festivities",
        imageUri: "/images/caribbeanparty.jpg"
      },
      {
        name: "Afrobeats vs. Dancehall Bash",
        dateTime: new Date("2024-09-22T21:00:00Z"),
        location: "Noyes Community Center",
        description: "A dance competition and social event celebrating both African and Caribbean music and dance styles.",
        numberOfAttendees: 250,
        category: "Festivities",
        imageUri: "/images/dancehalllvsafrobeats.jpg"
      },
      {
        name: "Black Student Cookout",
        dateTime: new Date("2024-09-29T16:00:00Z"),
        location: "North Campus Courtyard",
        description: "A casual BBQ gathering for Black and Caribbean students to connect over good food and music.",
        numberOfAttendees: 180,
        category: "Social",
        imageUri: "/images/cookout.jpg"
      },
      {
        name: "Soca & Steelpan Jam Session",
        dateTime: new Date("2024-10-05T19:00:00Z"),
        location: "Hans Bethe House Lounge",
        description: "A fun night where students can learn about and play Caribbean steelpan and enjoy soca music.",
        numberOfAttendees: 120,
        category: "Festivities",
        imageUri: "/images/steelband.jpg"
      },
      {
        name: "Carnival at Cornell",
        dateTime: new Date("2024-10-12T14:00:00Z"),
        location: "Ho Plaza",
        description: "A Caribbean carnival experience with vibrant costumes, performances, and cultural displays.",
        numberOfAttendees: 300,
        category: "Festivities",
        imageUri: "/images/carnival.jpg"
      },
      {
        name: "Reggae & Chill Movie Night",
        dateTime: new Date("2024-10-18T19:30:00Z"),
        location: "Africana Center Auditorium",
        description: "A screening of classic Caribbean or Black cinema with reggae and chill vibes.",
        numberOfAttendees: 90,
        category: "Social",
        imageUri: "/images/movienight.jpg"
      },
      {
        name: "Jerk & Jollof Cook-Off",
        dateTime: new Date("2024-10-25T17:00:00Z"),
        location: "RPCC Dining Hall",
        description: "A friendly cooking competition featuring popular Caribbean and African dishes.",
        numberOfAttendees: 130,
        category: "Festivities",
        imageUri: "/images/jerkandjolllof.jpg"
      },
      {
        name: "Diaspora Dance Workshop",
        dateTime: new Date("2024-11-02T18:00:00Z"),
        location: "Helen Newman Hall Dance Studio",
        description: "Learn different dance styles like Afrobeat, Dancehall, and Kompa from experienced dancers.",
        numberOfAttendees: 100,
        category: "Social",
        imageUri: "/images/danceworkshop.jpg"
      },
      {
        name: "Black & Caribbean Leadership Summit",
        dateTime: new Date("2024-11-09T09:00:00Z"),
        location: "Statler Hotel Ballroom",
        description: "A conference bringing together student leaders and professionals from various fields.",
        numberOfAttendees: 200,
        category: "Networking",
        imageUri: "/images/infosession.jpg"
      },
      {
        name: "Caribbean & Black Alumni Networking Night",
        dateTime: new Date("2024-11-15T18:30:00Z"),
        location: "Cornell Club, NYC",
        description: "A chance to connect with successful Black and Caribbean alumni.",
        numberOfAttendees: 150,
        category: "Networking",
        imageUri: "/images/networking.jpg"
      },
      {
        name: "Graduate School & Career Planning for Black Students",
        dateTime: new Date("2024-11-22T17:00:00Z"),
        location: "Goldwin Smith Hall, Room 132",
        description: "A panel discussion with professionals offering guidance on graduate programs and career paths.",
        numberOfAttendees: 80,
        category: "Networking",
        imageUri: "/images/graduateschool.jpg"
      },
      {
        name: "Internship & Scholarship Info Session for Caribbean & Black Students",
        dateTime: new Date("2024-12-02T16:30:00Z"),
        location: "Uris Hall, Room 306",
        description: "Learn about opportunities specifically for Caribbean and Black students.",
        numberOfAttendees: 100,
        category: "Networking",
        imageUri: "/images/scholarshipsesh.jpg"
      },
      {
        name: "Black & Caribbean Entrepreneurs Panel",
        dateTime: new Date("2024-12-08T18:00:00Z"),
        location: "ILR Conference Center",
        description: "A discussion with successful business owners from the Caribbean and Black diaspora.",
        numberOfAttendees: 120,
        category: "Networking",
        imageUri: "/images/panel.jpg"
      },
      {
        name: "Black Mental Health & Wellness Circle",
        dateTime: new Date("2024-12-12T19:00:00Z"),
        location: "Cornell Health, Room 110",
        description: "A space to discuss mental health, self-care, and well-being in a supportive community.",
        numberOfAttendees: 60,
        category: "Social",
        imageUri: "/images/wellnesscircle.jpg"
      },
      {
        name: "Caribbean & Black Study Sessions",
        dateTime: new Date("2024-12-15T18:00:00Z"),
        location: "Olin Library, Room 405",
        description: "Regular group study sessions to foster academic success.",
        numberOfAttendees: 50,
        category: "Social",
        imageUri: "/images/studysessions.jpg"
      },
      {
        name: "Friendsgiving: Caribbean & Soul Food Edition",
        dateTime: new Date("2024-11-27T17:30:00Z"),
        location: "Williard Straight Hall Dining Room",
        description: "A community potluck celebrating Thanksgiving with cultural dishes.",
        numberOfAttendees: 120,
        category: "Festivities",
        imageUri: "/images/fusion.jpg"
      },
      {
        name: "Kwanzaa Celebration",
        dateTime: new Date("2024-12-26T16:00:00Z"),
        location: "Africana Center",
        description: "A community gathering to celebrate the principles of Kwanzaa.",
        numberOfAttendees: 150,
        category: "Festivities",
        imageUri: "/images/kwanza.jpg"
      },
      {
        name: "Cultural Expressions Night",
        dateTime: new Date("2024-12-20T18:30:00Z"),
        location: "Bailey Hall Auditorium",
        description: "A showcase of music, poetry, and dance celebrating Black and Caribbean heritage at Cornell.",
        numberOfAttendees: 200,
        category: "Festivities",
        imageUri: "/images/culturalexpressions.jpg"
      }
    ];

    const result = await db.collection('events').insertMany(events);
    console.log(`✓ Inserted ${result.insertedIds.length} events`);

    // Create text index for search
    await db.collection('events').createIndex({ name: 'text', description: 'text' });
    console.log('✓ Created text index for search');

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

initDB();
