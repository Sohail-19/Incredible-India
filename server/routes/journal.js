const express = require('express');
const Journal = require('../models/Journal');
const Place = require('../models/Place');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All journal routes require authentication
router.use(authMiddleware);

/**
 * POST /api/journal
 * Create a new journal entry for the logged-in user
 */
router.post('/', async (req, res) => {
  try {
    const { place, visitDate, rating, notes, photoUrls } = req.body;

    if (!place || !visitDate) {
      return res.status(400).json({
        message: 'place and visitDate are required.',
      });
    }

    // Verify the place exists
    const placeDoc = await Place.findById(place);
    if (!placeDoc) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    const entry = await Journal.create({
      user: req.user.id,
      place,
      visitDate,
      rating,
      notes,
      photoUrls,
    });

    // Populate place details before returning
    await entry.populate('place', 'name slug state category imageUrls');

    console.log(`📓 Journal entry created for "${placeDoc.name}" by user ${req.user.id}`);

    res.status(201).json(entry);
  } catch (error) {
    console.error('❌ Error creating journal entry:', error.message);
    res.status(500).json({ message: 'Server error creating journal entry.' });
  }
});

/**
 * GET /api/journal
 * Get all journal entries for the logged-in user, populated with place details
 */
router.get('/', async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user.id })
      .populate('place', 'name slug state category imageUrls')
      .sort({ visitDate: -1 });

    console.log(`📓 Fetched ${entries.length} journal entries for user ${req.user.id}`);

    res.json(entries);
  } catch (error) {
    console.error('❌ Error fetching journal entries:', error.message);
    res.status(500).json({ message: 'Server error fetching journal entries.' });
  }
});

/**
 * DELETE /api/journal/:id
 * Delete a journal entry (must belong to logged-in user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found.' });
    }

    console.log(`🗑️  Deleted journal entry ${req.params.id} for user ${req.user.id}`);

    res.json({ message: 'Journal entry deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting journal entry:', error.message);
    res.status(500).json({ message: 'Server error deleting journal entry.' });
  }
});

module.exports = router;
