'use strict'

const fp = require('fastify-plugin')
const { performance } = require('perf_hooks')
const summary = require('summary')

const ONSEND = 'on-send-'
const PREHANDLER = 'pre-handler-'
const ROUTES = 'fastify-routes:'

module.exports = fp(async function (fastify, opts) {
  fastify.addHook('preHandler', function (request, reply, next) {
    const id = request.raw.id
    performance.mark(PREHANDLER + id)
    next()
  })

  fastify.addHook('onSend', function (request, reply, _, next) {
    const id = request.raw.id
    performance.mark(ONSEND + id)
    performance.measure(ROUTES + request.raw.url, PREHANDLER + id, ONSEND + id)
    next()
  })

  fastify.decorate('measurements', measurements)
  fastify.decorate('stats', stats)
})

function measurements () {
  return performance.getEntriesByType('measure').filter(e => {
    return e.name.indexOf(ROUTES) === 0
  }).reduce((acc, e) => {
    const key = e.name.split(':')[1]
    if (acc[key]) {
      acc[key].push(e.duration)
    } else {
      acc[key] = [e.duration]
    }
    return acc
  }, {})
}

function stats () {
  const m = measurements()

  return Object.keys(m).reduce((acc, k) => {
    const s = summary(m[k])
    acc[k] = {
      mean: s.mean(),
      mode: s.mode(),
      median: s.median(),
      max: s.max(),
      min: s.min(),
      sd: s.sd()
    }

    return acc
  }, {})
}
