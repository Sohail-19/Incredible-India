const mongoose = require('mongoose');
const slugify = require('slugify');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  region: {
    type: String,
    enum: ['North', 'South', 'East', 'West', 'Northeast', 'Central'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    enum: ['mountain', 'beach', 'heritage', 'wildlife', 'village'],
    required: [true, 'Category is required'],
  },
  season: {
    type: String,
    enum: ['summer', 'winter', 'monsoon', 'all-year'],
  },
  bestMonths: {
    type: [Number],
    validate: {
      validator: function (arr) {
        return arr.every((m) => m >= 1 && m <= 12);
      },
      message: 'bestMonths must contain numbers between 1 and 12',
    },
  },
  monthlyHighlights: [
    {
      month: { type: Number, min: 1, max: 12 },
      reason: { type: String },
    },
  ],
  crowdScore: {
    type: String,
    enum: ['low', 'rising', 'popular'],
  },
  crowdNote: {
    type: String,
  },
  budgetLevel: {
    type: String,
    enum: ['budget', 'mid', 'luxury'],
  },
  estimatedCostPerDay: {
    budget: { type: Number },
    mid: { type: Number },
    luxury: { type: Number },
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  altitude: {
    type: String,
  },
  nearestCity: {
    type: String,
  },
  distanceFromNearestCity: {
    type: String,
  },
  highlights: {
    type: [String],
  },
  imageUrls: {
    hero: { type: String },
    detail: { type: String },
    thumb: { type: String },
  },
  howToReach: {
    train: { type: String },
    bus: { type: String },
    road: { type: String },
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate slug from name before saving
placeSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Also generate slug on insertMany (used by seed script)
placeSchema.pre('insertMany', function (next, docs) {
  docs.forEach((doc) => {
    if (!doc.slug) {
      doc.slug = slugify(doc.name, { lower: true, strict: true });
    }
  });
  next();
});

// Create 2dsphere index for geospatial queries
placeSchema.index({ coordinates: '2dsphere' });

// Text index for search
placeSchema.index({ name: 'text', description: 'text', state: 'text' });

module.exports = mongoose.model('Place', placeSchema);
