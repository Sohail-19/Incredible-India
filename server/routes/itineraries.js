const express = require('express');
const Itinerary = require('../models/Itinerary');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All itinerary routes require authentication
router.use(authMiddleware);

/**
 * POST /api/itineraries
 * Save a generated itinerary for the logged-in user
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      startCity,
      days,
      budgetLevel,
      travelStyles,
      generatedPlan,
      placesUsed,
      totalCostEstimate,
    } = req.body;

    if (!title || !startCity || !days) {
      return res.status(400).json({
        message: 'title, startCity, and days are required.',
      });
    }

    const itinerary = await Itinerary.create({
      user: req.user.id,
      title,
      startCity,
      days,
      budgetLevel,
      travelStyles,
      generatedPlan,
      placesUsed,
      totalCostEstimate,
    });

    console.log(`📋 Itinerary saved: "${itinerary.title}" for user ${req.user.id}`);

    res.status(201).json(itinerary);
  } catch (error) {
    console.error('❌ Error saving itinerary:', error.message);
    res.status(500).json({ message: 'Server error saving itinerary.' });
  }
});

/**
 * GET /api/itineraries
 * Get all saved itineraries for the logged-in user
 */
router.get('/', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id })
      .populate('placesUsed', 'name slug state category imageUrls')
      .sort({ createdAt: -1 });

    console.log(`📋 Fetched ${itineraries.length} itineraries for user ${req.user.id}`);

    res.json(itineraries);
  } catch (error) {
    console.error('❌ Error fetching itineraries:', error.message);
    res.status(500).json({ message: 'Server error fetching itineraries.' });
  }
});

/**
 * GET /api/itineraries/:id
 * Get a single itinerary by ID (must belong to logged-in user)
 */
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('placesUsed');

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found.' });
    }

    res.json(itinerary);
  } catch (error) {
    console.error('❌ Error fetching itinerary:', error.message);
    res.status(500).json({ message: 'Server error fetching itinerary.' });
  }
});

/**
 * DELETE /api/itineraries/:id
 * Delete an itinerary (must belong to logged-in user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found.' });
    }

    console.log(`🗑️  Deleted itinerary: "${itinerary.title}" for user ${req.user.id}`);

    res.json({ message: 'Itinerary deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting itinerary:', error.message);
    res.status(500).json({ message: 'Server error deleting itinerary.' });
  }
});

module.exports = router;
