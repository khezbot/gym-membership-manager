// Creates the first admin account and three sample plans.
// Usage (from backend/): npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');

const samplePlans = [
  { name: 'Monthly Standard', description: 'Gym floor access, 6am–10pm', durationMonths: 1, price: 59 },
  { name: 'Quarterly Plus', description: 'Gym floor + group classes', durationMonths: 3, price: 159 },
  { name: 'Annual Premium', description: '24/7 access, classes and 2 PT sessions', durationMonths: 12, price: 549 },
];

(async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing user ${ADMIN_EMAIL} set to admin.`);
  } else {
    await User.create({ name: ADMIN_NAME || 'Gym Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log(`Admin ${ADMIN_EMAIL} created.`);
  }

  for (const p of samplePlans) {
    await Plan.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  }
  console.log('Sample plans ready.');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
