const mongoose = require('mongoose');

// A membership plan offered by the gym (e.g. "Monthly Standard", "Annual Premium").
const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 300 },
    durationMonths: { type: Number, required: true, min: 1, max: 24 },
    price: { type: Number, required: true, min: 0 },
    // Inactive plans are hidden from members but kept for history.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
