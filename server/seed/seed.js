const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Place = require('../models/Place');
const placesData = require('./placesData');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing places
    const deleted = await Place.deleteMany({});
    console.log(`🧹 Cleared ${deleted.deletedCount} existing places`);

    // Insert seed data
    const inserted = await Place.insertMany(placesData);
    console.log(`🌱 Seeded ${inserted.length} places successfully`);

    // Ensure 2dsphere index
    await Place.collection.createIndex({ coordinates: '2dsphere' });
    console.log('📍 Created 2dsphere index on coordinates');

    // Log inserted places
    inserted.forEach((place) => {
      console.log(`   ✓ ${place.name} (${place.state}) — ${place.slug}`);
    });

    console.log('\n🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();
