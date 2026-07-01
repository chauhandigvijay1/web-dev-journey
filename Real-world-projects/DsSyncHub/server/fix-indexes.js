const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const User = require('./src/models/User');
    
    // Sync indexes cleanly based on current schema
    await User.collection.dropIndex('phone_1').catch(e => console.log('Index phone_1 not found', e.message));
    
    await User.syncIndexes();
    console.log('Indexes synced cleanly!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
