const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')
const Workspace = require('../models/Workspace')

dotenv.config()

const syncIndexes = async () => {
  try {
    await connectDB()
    await Promise.all([User.syncIndexes(), Workspace.syncIndexes()])
    console.log('User and Workspace indexes synced successfully.')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Index sync failed:', error.message)
    try {
      await mongoose.connection.close()
    } catch (_closeError) {
      // Ignore close failures while exiting.
    }
    process.exit(1)
  }
}

syncIndexes()
