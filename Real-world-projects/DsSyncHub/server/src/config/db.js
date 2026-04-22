const mongoose = require('mongoose')
const dns = require('dns/promises')
const { execFile } = require('child_process')
const { promisify } = require('util')

const execFileAsync = promisify(execFile)

const resolveSrvWithNslookup = async (host) => {
  const { stdout } = await execFileAsync('nslookup', ['-type=SRV', `_mongodb._tcp.${host}`])
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('svr hostname'))
    .map((line) => line.split('=').pop()?.trim())
    .filter(Boolean)
    .map((name) => ({ name, port: 27017 }))
}

const buildDirectMongoUriFromSrv = async (mongoSrvUri) => {
  const normalized = mongoSrvUri.replace('mongodb+srv://', 'http://')
  const parsed = new URL(normalized)
  const username = parsed.username
  const password = parsed.password
  const host = parsed.host
  const database = parsed.pathname || ''
  const queryParams = new URLSearchParams(parsed.search)
  let srvRecords = []
  try {
    srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`)
  } catch (_dnsError) {
    srvRecords = await resolveSrvWithNslookup(host)
  }
  const txtRecords = await dns.resolveTxt(host).catch(() => [])

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`)
  const txtParams = new URLSearchParams(txtRecords.flat().join('&'))

  txtParams.forEach((value, key) => {
    if (!queryParams.has(key)) {
      queryParams.set(key, value)
    }
  })

  if (!queryParams.has('tls')) {
    queryParams.set('tls', 'true')
  }

  const credentials =
    username || password
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : ''
  return `mongodb://${credentials}${hosts.join(',')}${database}?${queryParams.toString()}`
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables.')
  }

  try {
    await mongoose.connect(mongoUri)
  } catch (error) {
    const shouldFallbackToDirectUri =
      typeof mongoUri === 'string' &&
      mongoUri.startsWith('mongodb+srv://') &&
      /querySrv/i.test(String(error?.message || ''))

    if (!shouldFallbackToDirectUri) {
      throw error
    }

    const directMongoUri = await buildDirectMongoUriFromSrv(mongoUri)
    await mongoose.connect(directMongoUri)
  }
}

module.exports = connectDB
