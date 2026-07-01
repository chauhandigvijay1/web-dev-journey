require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

const setAdminRole = async () => {
  const email = process.argv[2]?.toLowerCase()
  if (!email) {
    console.error('Usage: node scripts/setAdminRole.js <email>')
    console.error('Example: node scripts/setAdminRole.js adit669ya@gmail.com')
    process.exit(1)
  }

  try {
    await connectDB()
    const user = await User.findOne({ email })

    if (!user) {
      console.error(`User not found: ${email}`)
      process.exit(1)
    }

    const oldRole = user.role
    user.role = 'admin'
    await user.save()

    console.log(`✅ ${email} role changed: ${oldRole} → admin`)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

setAdminRole()
