const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer, app, agent, workspaceId

test.before(async () => {
  require('dotenv').config()
  mongoServer = await MongoMemoryServer.create()
  process.env.MONGO_URI = mongoServer.getUri()
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
  process.env.NODE_ENV = 'test'
  await mongoose.disconnect().catch(() => {})
  app = require('../src/app')
  await mongoose.connect(process.env.MONGO_URI)

  agent = request.agent(app)

  const reg = await agent.post('/api/auth/register').send({
    fullName: 'Test User',
    username: 'testuser_' + Date.now(),
    email: `flow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: 'StrongPass1!',
    confirmPassword: 'StrongPass1!',
  })
  assert.equal(reg.status, 201)
})

test.after(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

test('get own profile', async () => {
  const res = await agent.get('/api/users/me')
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.user.fullName, 'Test User')
})

test('update profile', async () => {
  const res = await agent.patch('/api/users/profile').send({
    fullName: 'Updated User',
    bio: 'Test bio',
  })
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.user.fullName, 'Updated User')
})

test('create workspace', async () => {
  const res = await agent.post('/api/workspaces').send({ name: 'Test Workspace' })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.ok(res.body.workspace.id)
  assert.equal(res.body.workspace.plan, 'free')
  workspaceId = res.body.workspace.id
})

test('list workspaces', async () => {
  const res = await agent.get('/api/workspaces')
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.ok(res.body.workspaces.length >= 1)
})

test('get workspace members', async () => {
  const res = await agent.get(`/api/workspaces/${workspaceId}/members`)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.ok(res.body.members.length >= 1)
})

test('create channel', async () => {
  const res = await agent.post('/api/channels').send({
    workspace: workspaceId,
    name: 'general-' + Date.now(),
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
})

test('create task', async () => {
  const res = await agent.post('/api/tasks').send({
    workspace: workspaceId,
    title: 'Test Task',
    description: 'A task to test',
    priority: 'high',
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.equal(res.body.task.title, 'Test Task')
  assert.equal(res.body.task.status, 'todo')
})

test('list tasks', async () => {
  const res = await agent.get(`/api/tasks?workspace=${workspaceId}`)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.ok(Array.isArray(res.body.tasks))
})

test('create note', async () => {
  const res = await agent.post('/api/notes').send({
    workspace: workspaceId,
    title: 'Test Note',
    content: '<p>Hello world</p>',
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.equal(res.body.note.title, 'Test Note')
})

test('create calendar event', async () => {
  const res = await agent.post('/api/calendar').send({
    workspace: workspaceId,
    title: 'Test Event',
    date: new Date(),
    color: '#ff0000',
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.equal(res.body.event.title, 'Test Event')
})

test('list calendar events', async () => {
  const res = await agent.get(`/api/calendar?workspace=${workspaceId}`)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.ok(res.body.events.length >= 1)
})

test('create meeting', async () => {
  const res = await agent.post('/api/meetings/rooms').send({
    workspace: workspaceId,
    title: 'Test Meeting',
  })
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.ok(res.body.meeting.roomId)
})

test('update workspace', async () => {
  const res = await agent.patch(`/api/workspaces/${workspaceId}`).send({ name: 'Updated Workspace' })
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.workspace.name, 'Updated Workspace')
})

test('versioned API works', async () => {
  const res = await agent.get('/api/v1/health')
  assert.equal(res.status, 200)
  assert.equal(res.body.status, 'ok')
})

test('unauthenticated request rejected', async () => {
  const res = await request(app).post('/api/workspaces').send({ name: 'Hacker' })
  assert.equal(res.status, 401)
})
