import assert from 'node:assert/strict'
import test from 'node:test'
import app from '../app.js'

let server
let baseUrl

test.before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(() => server.close())

test('health reports API status without requiring MongoDB', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.success, true)
  assert.equal(body.data.status, 'ok')
})

test('protected operational routes reject unauthenticated access', async () => {
  const routes = ['/api/v1/students', '/api/v1/attendance/summary', '/api/v1/notifications', '/api/v1/cms/news', '/api/v1/uploads/profile-image']
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, route.includes('/uploads/') ? { method: 'POST' } : undefined)
    assert.equal(response.status, 401, route)
  }
})

test('chatbot validates and answers public questions', async () => {
  const response = await fetch(`${baseUrl}/api/v1/chatbot`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'How do I apply?' }) })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.match(body.data.answer, /Admissions/i)
})
