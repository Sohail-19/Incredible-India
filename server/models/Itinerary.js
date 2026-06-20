const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  title: {
    type: String,
    required: [true, 'Itinerary title is required'],
    trim: true,
  },
  startCity: {
    type: String,
    required: [true, 'Start city is required'],
    trim: true,
  },
  days: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: 1,
    max: 30,
  },
  budgetLevel: {
    type: String,
    enum: ['budget', 'mid', 'luxury'],
  },
  travelStyles: {
    type: [String],
  },
  generatedPlan: {
    type: mongoose.Schema.Types.Mixed,
  },
  placesUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
  ],
  totalCostEstimate: {
    min: { type: Number },
    max: { type: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
