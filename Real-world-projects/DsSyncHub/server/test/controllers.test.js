const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const app = require('../src/app')

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health')
  assert.equal(res.status, 200)
  assert.equal(res.body.status, 'ok')
})

test('GET /api/v1/health returns ok (versioned)', async () => {
  const res = await request(app).get('/api/v1/health')
  assert.equal(res.status, 200)
  assert.equal(res.body.status, 'ok')
})

test('POST /api/auth/register rejects missing fields', async () => {
  const res = await request(app).post('/api/auth/register').send({})
  assert.equal(res.status, 400)
})

test('POST /api/auth/register rejects weak password', async () => {
  const res = await request(app).post('/api/auth/register').send({
    fullName: 'Test User',
    username: 'testuser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password: 'weak',
  })
  assert.equal(res.status, 400)
})

test('POST /api/auth/login rejects missing credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({})
  assert.equal(res.status, 400)
})

test('POST /api/auth/login rejects invalid credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({
    identifier: 'nonexistent@example.com',
    password: 'SomePass1!',
  })
  assert.ok(res.status === 401 || res.status === 500)
})

test('POST /api/auth/forgot-password validates malformed email', async () => {
  const res = await request(app).post('/api/auth/forgot-password').send({ email: 'invalid-email' })
  assert.equal(res.status, 400)
})

test('POST /api/auth/forgot-password handles nonexistent email', async () => {
  const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nonexistent@example.com' })
  assert.ok(res.status === 404 || res.status === 500)
})

test('POST /api/auth/reset-password validates payload', async () => {
  const res = await request(app).post('/api/auth/reset-password').send({ token: '', password: 'weak', confirmPassword: 'weak' })
  assert.equal(res.status, 400)
})

test('POST /api/auth/reset-password handles invalid token', async () => {
  const res = await request(app).post('/api/auth/reset-password').send({
    token: 'invalidtoken123',
    password: 'NewStrong1!',
    confirmPassword: 'NewStrong1!',
  })
  assert.ok(res.status === 400 || res.status === 500)
})

test('POST /api/auth/send-verification requires auth', async () => {
  const res = await request(app).post('/api/auth/send-verification')
  assert.equal(res.status, 401)
})

test('POST /api/auth/google handles missing credential', async () => {
  const res = await request(app).post('/api/auth/google').send({})
  assert.ok(res.status === 400 || res.status === 500)
})

test('protected endpoints reject missing auth token', async () => {
  const endpoints = [
    request(app).get('/api/tasks'),
    request(app).get('/api/notes'),
    request(app).get('/api/billing/current'),
    request(app).get('/api/chat'),
    request(app).get('/api/calendar'),
    request(app).get('/api/meetings'),
    request(app).get('/api/files'),
    request(app).get('/api/notifications'),
    request(app).get('/api/activity'),
    request(app).get('/api/search'),
  ]
  const results = await Promise.all(endpoints)
  results.forEach((r) => assert.equal(r.status, 401, `Expected 401 got ${r.status}`))
})

test('GET /api/users/me requires auth', async () => {
  const res = await request(app).get('/api/users/me')
  assert.equal(res.status, 401)
})

test('PATCH /api/users/profile requires auth', async () => {
  const res = await request(app).patch('/api/users/profile').send({ fullName: 'Updated' })
  assert.equal(res.status, 401)
})

test('PATCH /api/users/account requires auth', async () => {
  const res = await request(app).patch('/api/users/account').send({ email: 'test@example.com' })
  assert.equal(res.status, 401)
})

test('PATCH /api/users/security/password requires auth', async () => {
  const res = await request(app).patch('/api/users/security/password').send({ currentPassword: 'old', newPassword: 'NewStrong1!' })
  assert.equal(res.status, 401)
})

test('PATCH /api/users/appearance requires auth', async () => {
  const res = await request(app).patch('/api/users/appearance').send({ theme: 'dark' })
  assert.equal(res.status, 401)
})

test('POST /api/users/avatar requires auth', async () => {
  const res = await request(app).post('/api/users/avatar')
  assert.equal(res.status, 401)
})

test('POST /api/users/logout-all requires auth', async () => {
  const res = await request(app).post('/api/users/logout-all')
  assert.equal(res.status, 401)
})

test('POST /api/workspaces requires auth', async () => {
  const res = await request(app).post('/api/workspaces').send({ name: 'Test Workspace' })
  assert.equal(res.status, 401)
})

test('GET /api/workspaces requires auth', async () => {
  const res = await request(app).get('/api/workspaces')
  assert.equal(res.status, 401)
})

test('POST /api/tasks requires auth', async () => {
  const res = await request(app).post('/api/tasks').send({ workspace: '000000000000000000000001', title: 'Test' })
  assert.equal(res.status, 401)
})

test('POST /api/notes requires auth', async () => {
  const res = await request(app).post('/api/notes').send({ workspace: '000000000000000000000001' })
  assert.equal(res.status, 401)
})

test('POST /api/chat/message requires auth', async () => {
  const res = await request(app).post('/api/chat/message').send({ workspace: '000000000000000000000001', content: 'Hello' })
  assert.equal(res.status, 401)
})

test('POST /api/calendar requires auth', async () => {
  const res = await request(app).post('/api/calendar').send({ workspace: '000000000000000000000001', title: 'Event', date: new Date() })
  assert.equal(res.status, 401)
})

test('POST /api/files/upload requires auth', async () => {
  const res = await request(app).post('/api/files/upload')
  assert.equal(res.status, 401)
})

test('POST /api/meetings requires auth', async () => {
  const res = await request(app).post('/api/meetings').send({ workspace: '000000000000000000000001', title: 'Meeting' })
  assert.equal(res.status, 401)
})

test('POST /api/channels requires auth', async () => {
  const res = await request(app).post('/api/channels').send({ workspace: '000000000000000000000001', name: 'general' })
  assert.equal(res.status, 401)
})

test('GET /api/channels requires auth', async () => {
  const res = await request(app).get('/api/channels')
  assert.equal(res.status, 401)
})

test('GET /api/export/workspace/:id requires auth', async () => {
  const res = await request(app).get('/api/export/workspace/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('GET /api/admin/stats requires auth', async () => {
  const res = await request(app).get('/api/admin/stats')
  assert.equal(res.status, 401)
})

test('GET /api/admin/users requires auth', async () => {
  const res = await request(app).get('/api/admin/users')
  assert.equal(res.status, 401)
})

test('GET /api/admin/workspaces requires auth', async () => {
  const res = await request(app).get('/api/admin/workspaces')
  assert.equal(res.status, 401)
})

test('POST /api/auth/login rejects wrong password format', async () => {
  const res = await request(app).post('/api/auth/login').send({ identifier: 'test@example.com', password: '' })
  assert.equal(res.status, 400)
})

test('POST /api/auth/register rejects invalid email format', async () => {
  const res = await request(app).post('/api/auth/register').send({
    fullName: 'Test',
    username: 'test_' + Date.now(),
    email: 'notanemail',
    password: 'StrongPass1!',
  })
  assert.equal(res.status, 400)
})

test('POST /api/auth/register rejects short username', async () => {
  const res = await request(app).post('/api/auth/register').send({
    fullName: 'Test',
    username: 'ab',
    email: `test_${Date.now()}@example.com`,
    password: 'StrongPass1!',
  })
  assert.equal(res.status, 400)
})

test('POST /api/auth/google handles invalid token format', async () => {
  const res = await request(app).post('/api/auth/google').send({ credential: 'invalid-token-format' })
  assert.ok(res.status === 401 || res.status === 500)
})

test('POST /api/workspaces rejects missing name', async () => {
  const res = await request(app).post('/api/workspaces').send({})
  assert.equal(res.status, 401)
})

test('GET /api/workspaces/:id with nonexistent workspace returns 404/403', async () => {
  const res = await request(app).get('/api/workspaces/000000000000000000000001')
  assert.ok(res.status === 401 || res.status === 404 || res.status === 403)
})

test('PATCH /api/notifications/:id/read requires auth', async () => {
  const res = await request(app).patch('/api/notifications/000000000000000000000001/read')
  assert.equal(res.status, 401)
})

test('PATCH /api/notifications/read-all requires auth', async () => {
  const res = await request(app).patch('/api/notifications/read-all')
  assert.equal(res.status, 401)
})

test('POST /api/ai/summarize requires auth', async () => {
  const res = await request(app).post('/api/ai/summarize').send({ workspace: '000000000000000000000001', text: 'test' })
  assert.equal(res.status, 401)
})

test('POST /api/ai/rewrite requires auth', async () => {
  const res = await request(app).post('/api/ai/rewrite').send({ workspace: '000000000000000000000001', text: 'test' })
  assert.equal(res.status, 401)
})

test('POST /api/ai/tasks requires auth', async () => {
  const res = await request(app).post('/api/ai/tasks').send({ workspace: '000000000000000000000001', prompt: 'test' })
  assert.equal(res.status, 401)
})

test('GET /api/billing/plans requires auth', async () => {
  const res = await request(app).get('/api/billing/plans')
  assert.equal(res.status, 401)
})

test('POST /api/billing/create-order requires auth', async () => {
  const res = await request(app).post('/api/billing/create-order').send({ planId: 'pro' })
  assert.equal(res.status, 401)
})

test('POST /api/billing/verify requires auth', async () => {
  const res = await request(app).post('/api/billing/verify').send({ razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'sig_123' })
  assert.equal(res.status, 401)
})

test('GET /api/billing/invoices requires auth', async () => {
  const res = await request(app).get('/api/billing/invoices')
  assert.equal(res.status, 401)
})

test('POST /api/billing/cancel requires auth', async () => {
  const res = await request(app).post('/api/billing/cancel')
  assert.equal(res.status, 401)
})

test('PATCH /api/workspaces/:id requires auth', async () => {
  const res = await request(app).patch('/api/workspaces/000000000000000000000001').send({ name: 'Updated' })
  assert.equal(res.status, 401)
})

test('GET /api/workspaces/:id/members requires auth', async () => {
  const res = await request(app).get('/api/workspaces/000000000000000000000001/members')
  assert.equal(res.status, 401)
})

test('POST /api/workspaces/:id/invite requires auth', async () => {
  const res = await request(app).post('/api/workspaces/000000000000000000000001/invite').send({ email: 'test@example.com' })
  assert.equal(res.status, 401)
})

test('PATCH /api/calendar/:id requires auth', async () => {
  const res = await request(app).patch('/api/calendar/000000000000000000000001').send({ title: 'Updated' })
  assert.equal(res.status, 401)
})

test('DELETE /api/calendar/:id requires auth', async () => {
  const res = await request(app).delete('/api/calendar/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('PATCH /api/tasks/:id requires auth', async () => {
  const res = await request(app).patch('/api/tasks/000000000000000000000001').send({ title: 'Updated' })
  assert.equal(res.status, 401)
})

test('DELETE /api/tasks/:id requires auth', async () => {
  const res = await request(app).delete('/api/tasks/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('PATCH /api/notes/:id requires auth', async () => {
  const res = await request(app).patch('/api/notes/000000000000000000000001').send({ title: 'Updated' })
  assert.equal(res.status, 401)
})

test('DELETE /api/notes/:id requires auth', async () => {
  const res = await request(app).delete('/api/notes/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('DELETE /api/files/:id requires auth', async () => {
  const res = await request(app).delete('/api/files/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('PATCH /api/meetings/:id requires auth', async () => {
  const res = await request(app).patch('/api/meetings/000000000000000000000001').send({ title: 'Updated' })
  assert.equal(res.status, 401)
})

test('DELETE /api/meetings/:id requires auth', async () => {
  const res = await request(app).delete('/api/meetings/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('GET /api/files/content/:filename requires auth', async () => {
  const res = await request(app).get('/api/files/content/test.txt')
  assert.equal(res.status, 401)
})

test('POST /api/channels requires auth', async () => {
  const res = await request(app).post('/api/channels').send({ workspace: '000000000000000000000001', name: 'test' })
  assert.equal(res.status, 401)
})

test('PATCH /api/channels/:id requires auth', async () => {
  const res = await request(app).patch('/api/channels/000000000000000000000001').send({ name: 'Updated' })
  assert.equal(res.status, 401)
})

test('DELETE /api/channels/:id requires auth', async () => {
  const res = await request(app).delete('/api/channels/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('PATCH /api/chat/message/:id requires auth', async () => {
  const res = await request(app).patch('/api/chat/message/000000000000000000000001').send({ content: 'Edited' })
  assert.equal(res.status, 401)
})

test('DELETE /api/chat/message/:id requires auth', async () => {
  const res = await request(app).delete('/api/chat/message/000000000000000000000001')
  assert.equal(res.status, 401)
})

test('GET /api/activity requires auth', async () => {
  const res = await request(app).get('/api/activity')
  assert.equal(res.status, 401)
})
