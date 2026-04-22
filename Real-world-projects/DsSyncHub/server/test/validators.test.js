const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isStrongPassword,
  isValidEmail,
  isValidPhone,
  isValidUsername,
} = require('../src/utils/validators')

test('email validator accepts standard emails', () => {
  assert.equal(isValidEmail('user@example.com'), true)
  assert.equal(isValidEmail('bad-email'), false)
})

test('username validator enforces project constraints', () => {
  assert.equal(isValidUsername('team_member-01'), true)
  assert.equal(isValidUsername('ab'), false)
  assert.equal(isValidUsername('bad username'), false)
})

test('phone validator supports international format', () => {
  assert.equal(isValidPhone('+919999999999'), true)
  assert.equal(isValidPhone('1234'), false)
})

test('password validator requires mixed complexity', () => {
  assert.equal(isStrongPassword('VeryStrong1!'), true)
  assert.equal(isStrongPassword('weakpass'), false)
})
