'use strict'

const { beforeEach, test } = require('tap')
const { performance } = require('perf_hooks')
const { Transform } = require('stream')
const Fastify = require('fastify')
const Stats = require('.')
const fakeTimer = require('@sinonjs/fake-timers')

beforeEach(async () => {
  performance.clearMarks()
})

test('produces some stats', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.ok(nums[0] >= 0)
  t.ok(nums.length === 1)
})

test('has no conflicts with custom measures', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

  fastify.get('/', async () => {
    performance.mark('A')
    performance.mark('B')
    performance.measure('A to B', 'A', 'B')

    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.ok(nums[0] >= 0)
  t.ok(nums.length === 1)
})

test('measurements returns an array', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

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

  const measurements = fastify.measurements()
  const nums = measurements.GET['/']
  t.ok(nums.length === 3)
  t.ok(nums[0] >= 0)
  t.ok(nums[1] >= 0)
  t.ok(nums[2] >= 0)
})

test('creates stats', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

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

  const stats = fastify.stats()
  const nums = stats.GET['/']
  t.ok(nums.mean >= 0)
  t.ok(nums.mode >= 0)
  t.ok(nums.median >= 0)
  t.ok(nums.max >= 0)
  t.ok(nums.min >= 0)
  t.ok(nums.sd >= 0)
})

test('group stats together', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

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

  const stats = fastify.stats()
  const nums = stats.GET['grouped-stats']
  t.ok(Object.keys(stats).length === 1)
  t.ok(nums)
  t.ok(nums.mean >= 0)
  t.ok(nums.mode >= 0)
  t.ok(nums.median >= 0)
  t.ok(nums.max >= 0)
  t.ok(nums.min >= 0)
  t.ok(nums.sd >= 0)
})

test('produces stats for multiple methods', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

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

  const measurements = fastify.measurements()
  const gets = measurements.GET['/']
  t.ok(gets[0] >= 0)
  t.ok(gets.length === 1)

  const posts = measurements.POST['/']
  t.ok(posts[0] >= 0)
  t.ok(posts.length === 1)
})

test('produces stats for multiple routes of method', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  t.teardown(fastify.close.bind(fastify))

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

  const stats = fastify.stats()
  Object.values(stats.GET).forEach(nums => {
    t.ok(nums.mean >= 0)
    t.ok(nums.mode >= 0)
    t.ok(nums.median >= 0)
    t.ok(nums.max >= 0)
    t.ok(nums.min >= 0)
    t.ok(nums.sd >= 0)
  })
})

test('logs stats every 30 sec', async (t) => {
  const clock = fakeTimer.install()

  const stream = new Transform({
    objectMode: true,
    transform: (chunk, enc, cb) => cb(null, JSON.parse(chunk))
  })

  const fastify = Fastify({ logger: { stream: stream, level: 'info' } })
  fastify.register(Stats)

  t.teardown(() => {
    clock.uninstall()
    fastify.close()
  })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  const matches = [
    { msg: /incoming request/ },
    { msg: /request completed/ },
    { msg: /routes stats/ }
  ]

  let i = 0
  stream.on('data', line => {
    t.match(line, matches[i])
    i += 1
  })

  await fastify.inject({
    url: '/'
  })

  clock.tick('00:35')
})
