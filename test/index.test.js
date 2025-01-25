'use strict'

const { beforeEach, test } = require('node:test')
const { performance } = require('node:perf_hooks')
const { Transform } = require('node:stream')
const Fastify = require('fastify')
const Stats = require('..')
const fakeTimer = require('@sinonjs/fake-timers')
const setTimeoutPromise = require('node:util').promisify(setTimeout)

beforeEach(async () => {
  performance.clearMarks()
})

test('produces some stats', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  await setTimeoutPromise(10)
  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.assert.ok(nums[0] >= 0)
  t.assert.ok(nums.length === 1)
})

test('has no conflicts with custom measures', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    performance.mark('A')
    performance.mark('B')
    performance.measure('A to B', 'A', 'B')

    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  await setTimeoutPromise(10)
  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.assert.ok(nums[0] >= 0)
  t.assert.ok(nums.length === 1)
})

test('measurements returns an array', async (t) => {
  t.plan(4)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  await fastify.inject({
    url: '/'
  })

  await fastify.inject({
    url: '/'
  })

  await setTimeoutPromise(10)
  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.assert.ok(nums.length === 3)
  t.assert.ok(nums[0] >= 0)
  t.assert.ok(nums[1] >= 0)
  t.assert.ok(nums[2] >= 0)
})

test('creates stats', async (t) => {
  t.plan(6)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  await fastify.inject({
    url: '/'
  })

  await fastify.inject({
    url: '/'
  })

  await setTimeoutPromise(10)
  const stats = fastify.stats()
  const nums = stats.GET['/']
  t.assert.ok(nums.mean >= 0)
  t.assert.ok(nums.mode >= 0)
  t.assert.ok(nums.median >= 0)
  t.assert.ok(nums.max >= 0)
  t.assert.ok(nums.min >= 0)
  t.assert.ok(nums.sd >= 0)
})

test('group stats together', async (t) => {
  t.plan(8)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/:param/grouped-stats', { config: { statsId: 'grouped-stats' } }, async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/1/grouped-stats'
  })

  await fastify.inject({
    url: '/2/grouped-stats'
  })

  await fastify.inject({
    url: '/3/grouped-stats'
  })

  await setTimeoutPromise(10)
  const stats = fastify.stats()
  const nums = stats.GET['grouped-stats']
  t.assert.ok(Object.keys(stats).length === 1)
  t.assert.ok(nums)
  t.assert.ok(nums.mean >= 0)
  t.assert.ok(nums.mode >= 0)
  t.assert.ok(nums.median >= 0)
  t.assert.ok(nums.max >= 0)
  t.assert.ok(nums.min >= 0)
  t.assert.ok(nums.sd >= 0)
})

test('produces stats for multiple methods', async (t) => {
  t.plan(4)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    return { hello: 'world', method: 'GET' }
  })

  fastify.post('/', async () => {
    return { hello: 'world', method: 'POST' }
  })

  await fastify.inject({
    url: '/'
  })

  await fastify.inject({
    url: '/',
    method: 'POST'
  })

  await setTimeoutPromise(10)
  const measurements = fastify.measurements()
  const gets = measurements.GET['/']
  t.assert.ok(gets[0] >= 0)
  t.assert.ok(gets.length === 1)

  const posts = measurements.POST['/']
  t.assert.ok(posts[0] >= 0)
  t.assert.ok(posts.length === 1)
})

test('produces stats for multiple routes of method', async (t) => {
  t.plan(12)

  const fastify = Fastify()
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/first', async () => {
    return { hello: 'world' }
  })

  fastify.get('/second', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/first'
  })

  await fastify.inject({
    url: '/first'
  })

  await fastify.inject({
    url: '/second'
  })

  await fastify.inject({
    url: '/second'
  })

  await setTimeoutPromise(10)
  const stats = fastify.stats()
  Object.values(stats.GET).forEach(nums => {
    t.assert.ok(nums.mean >= 0)
    t.assert.ok(nums.mode >= 0)
    t.assert.ok(nums.median >= 0)
    t.assert.ok(nums.max >= 0)
    t.assert.ok(nums.min >= 0)
    t.assert.ok(nums.sd >= 0)
  })
})

test('logs stats every printInterval sec', async (t) => {
  t.plan(3)

  const stream = new Transform({
    objectMode: true,
    transform: (chunk, enc, cb) => cb(null, JSON.parse(chunk))
  })

  const fastify = Fastify({ logger: { stream, level: 'info' } })
  fastify.register(Stats, { printInterval: 500 })

  t.after(() => {
    clock.uninstall()
    fastify.close()
  })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  const matches = [
    /incoming request/,
    /request completed/,
    /routes stats/
  ]

  let i = 0
  stream.on('data', line => {
    t.assert.match(line.msg, matches[i], `Line ${i}`)
    i += 1
  })

  await fastify.inject({
    url: '/'
  })

  await setTimeoutPromise(800)
  const clock = fakeTimer.install()
  await clock.tickAsync(35000)
})

test('reply sent in a onRequest hook before stats registered', async (t) => {
  t.plan(1)

  const stream = new Transform({
    objectMode: true,
    transform: (chunk, enc, cb) => cb(null, JSON.parse(chunk))
  })

  const fastify = Fastify({ logger: { stream, level: 'error' } })

  fastify.addHook('onRequest', (request, reply, next) => {
    reply.send()
    next()
  })

  // const match = { msg: /missing request mark/ }

  stream.on('data', line => {
    t.assert.match(line.msg, /missing request mark/, 'Line matched')
  })
  fastify.register(Stats)

  t.after(() => { fastify.close() })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })
})
