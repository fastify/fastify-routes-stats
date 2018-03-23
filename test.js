'use strict'

const { beforeEach, test } = require('tap')
const { performance } = require('perf_hooks')
const Fastify = require('fastify')
const Stats = require('.')

beforeEach(async () => {
  performance.clearMarks()
  performance.clearMeasures()
})

test('produces some stats', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.inject({
    url: '/'
  })

  const measurements = fastify.measurements()
  const nums = measurements['/']
  t.ok(nums[0] >= 0)
  t.ok(nums.length === 1)
})

test('measurements returns an array', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

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
  const nums = measurements['/']
  t.ok(nums.length === 3)
  t.ok(nums[0] >= 0)
  t.ok(nums[1] >= 0)
  t.ok(nums[2] >= 0)
})

test('creates stats', async (t) => {
  const fastify = Fastify()
  fastify.register(Stats)

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
  const nums = stats['/']
  t.ok(nums.mean >= 0)
  t.ok(nums.mode >= 0)
  t.ok(nums.median >= 0)
  t.ok(nums.max >= 0)
  t.ok(nums.min >= 0)
  t.ok(nums.sd >= 0)
})
