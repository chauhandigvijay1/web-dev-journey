const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const app = require('../src/app')

test('GET /api/health returns ok', async () => {
  const response = await request(app).get('/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
})

test('POST /api/auth/forgot-password validates malformed email', async () => {
  const response = await request(app).post('/api/auth/forgot-password').send({ email: 'invalid-email' })
  assert.equal(response.status, 400)
})

test('POST /api/auth/reset-password validates payload before DB work', async () => {
  const response = await request(app).post('/api/auth/reset-password').send({
    token: '',
    password: 'weak',
    confirmPassword: 'weak',
  })
  assert.equal(response.status, 400)
})

test('protected endpoints reject missing auth token', async () => {
  const [tasks, notes, billing] = await Promise.all([
    request(app).get('/api/tasks'),
    request(app).get('/api/notes'),
    request(app).get('/api/billing/current'),
  ])

  assert.equal(tasks.status, 401)
  assert.equal(notes.status, 401)
  assert.equal(billing.status, 401)
})
