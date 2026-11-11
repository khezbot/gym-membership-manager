// Creates the first admin account.
// Usage (from backend/): npm run seed
// (Sample plans are added in GMM-7 once the Plan model exists.)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});