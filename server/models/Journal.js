const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'Place is required'],
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    trim: true,
  },
  photoUrls: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Journal', journalSchema);
