
// scripts/createAdmin.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.', '.env') });
const mongoose = require('mongoose');
const User = require(path.resolve(__dirname, '.', 'models', 'User'));

const EMAIL = 'srikartapr@gmail.com';
const PLAIN = 'sanjayMohanpr';

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    let user = await User.findOne({ email: EMAIL });

    if (!user) {
      user = new User({
        name: 'Admin User',
        email: EMAIL,
        password: PLAIN,   // ⚠️ give plain text — model will hash
        role: 'admin',
      });
      await user.save();
      console.log('✅ Created admin user:', EMAIL);
    } else {
      user.password = PLAIN; // ⚠️ plain text, hook will hash
      user.role = 'admin';
      await user.save();
      console.log('✅ Updated admin user (password + role):', EMAIL);
    }

    await mongoose.disconnect();
    console.log('🎉 Done. You can now login with', EMAIL, 'password:', PLAIN);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

run();
