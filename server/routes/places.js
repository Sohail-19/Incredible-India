const express = require('express');
const Place = require('../models/Place');

const router = express.Router();

/**
 * GET /api/places
 * Get all places with optional filtering
 * Query params: ?category= &season= &crowdScore= &search=
 */
router.get('/', async (req, res) => {
  try {
    const { category, season, crowdScore, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (season) filter.season = season;
    if (crowdScore) filter.crowdScore = crowdScore;

    // Text search using MongoDB $text index
    if (search) {
      filter.$text = { $search: search };
    }

    const places = await Place.find(filter).sort({ rating: -1 });

    console.log(`📍 Fetched ${places.length} places (filters: ${JSON.stringify(req.query)})`);

    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching places:', error.message);
    res.status(500).json({ message: 'Server error fetching places.' });
  }
});

/**
 * GET /api/places/month/:month
 * Get places where bestMonths includes this month number
 */
router.get('/month/:month', async (req, res) => {
  try {
    const month = parseInt(req.params.month);

    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Month must be a number between 1 and 12.' });
    }

    const places = await Place.find({ bestMonths: month }).sort({ rating: -1 });

    console.log(`📅 Fetched ${places.length} places for month ${month}`);

    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching places by month:', error.message);
    res.status(500).json({ message: 'Server error fetching places by month.' });
  }
});

/**
 * GET /api/places/nearby?lat=&lng=&radius=
 * Find places near a given point using 2dsphere index
 * radius in km (default 100km)
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query parameters are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius) || 100;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers.' });
    }

    // Convert km to meters for MongoDB $maxDistance
    const radiusMeters = radiusKm * 1000;

    const places = await Place.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
          },
          $maxDistance: radiusMeters,
        },
      },
    });

    console.log(`📍 Found ${places.length} places within ${radiusKm}km of [${lat}, ${lng}]`);

    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching nearby places:', error.message);
    res.status(500).json({ message: 'Server error fetching nearby places.' });
  }
});

/**
 * GET /api/places/:slug
 * Get a single place by its slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });

    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    console.log(`📍 Fetched place: ${place.name}`);

    res.json(place);
  } catch (error) {
    console.error('❌ Error fetching place:', error.message);
    res.status(500).json({ message: 'Server error fetching place.' });
  }
});

module.exports = router;
