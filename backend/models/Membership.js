const mongoose = require('mongoose');

// A member's request for / subscription to a plan.
// Lifecycle: pending -> active | rejected ; pending|active -> cancelled
const STATUSES = ['pending', 'active', 'rejected', 'cancelled'];

const membershipSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // set when the request is approved
    status: { type: String, enum: STATUSES, default: 'pending' },
    adminNote: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Membership', membershipSchema);
module.exports.STATUSES = STATUSES;
