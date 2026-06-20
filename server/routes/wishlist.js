const express = require('express');
const Wishlist = require('../models/Wishlist');
const Place = require('../models/Place');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

/**
 * GET /api/wishlist
 * Get the logged-in user's wishlist, populated with place details
 */
router.get('/', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('places');

    if (!wishlist) {
      // Return empty wishlist if none exists yet
      return res.json({ user: req.user.id, places: [] });
    }

    console.log(`💛 Fetched wishlist for user ${req.user.id}: ${wishlist.places.length} places`);

    res.json(wishlist);
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error.message);
    res.status(500).json({ message: 'Server error fetching wishlist.' });
  }
});

/**
 * POST /api/wishlist/:placeId
 * Add a place to the user's wishlist
 */
router.post('/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;

    // Verify the place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    // Find or create wishlist for this user
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        places: [placeId],
      });
    } else {
      // Check if place is already in wishlist
      if (wishlist.places.includes(placeId)) {
        return res.status(409).json({ message: 'Place is already in your wishlist.' });
      }
      wishlist.places.push(placeId);
      await wishlist.save();
    }

    // Populate and return
    await wishlist.populate('places');

    console.log(`💛 Added ${place.name} to wishlist for user ${req.user.id}`);

    res.status(201).json(wishlist);
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error.message);
    res.status(500).json({ message: 'Server error adding to wishlist.' });
  }
});

/**
 * DELETE /api/wishlist/:placeId
 * Remove a place from the user's wishlist
 */
router.delete('/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const index = wishlist.places.indexOf(placeId);
    if (index === -1) {
      return res.status(404).json({ message: 'Place not found in your wishlist.' });
    }

    wishlist.places.splice(index, 1);
    await wishlist.save();
    await wishlist.populate('places');

    console.log(`💔 Removed place ${placeId} from wishlist for user ${req.user.id}`);

    res.json(wishlist);
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error.message);
    res.status(500).json({ message: 'Server error removing from wishlist.' });
  }
});

module.exports = router;
