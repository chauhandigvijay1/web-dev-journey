const logger = require('./logger')

let emailQueue = null

const getEmailQueue = () => {
  if (emailQueue) return emailQueue
  if (!process.env.REDIS_URL) return null

  try {
    const Bull = require('bull')
    emailQueue = new Bull('email-queue', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })

    emailQueue.on('completed', (job) => {
      logger.info({ jobId: job.id, type: job.data.type }, 'Email sent')
    })

    emailQueue.on('failed', (job, err) => {
      logger.error({ jobId: job.id, type: job.data.type, err: err.message }, 'Email failed')
    })

    emailQueue.process(async (job) => {
      const { type, payload } = job.data
      const emailService = require('./emailService')

      switch (type) {
        case 'password-reset':
          await emailService.sendPasswordResetEmail(payload)
          break
        case 'verify-email':
          await emailService.sendVerificationEmail(payload)
          break
        case 'invite':
          await emailService.sendInviteEmail(payload)
          break
        default:
          throw new Error(`Unknown email type: ${type}`)
      }
    })

    logger.info('Email queue initialized')
    return emailQueue
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to initialize email queue — falling back to direct send')
    return null
  }
}

const addToEmailQueue = (type, payload) => {
  const queue = getEmailQueue()
  if (queue) {
    queue.add({ type, payload })
    return true
  }
  return false
}

module.exports = { getEmailQueue, addToEmailQueue }
