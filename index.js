'use strict'

const fp = require('fastify-plugin')
const { performance, PerformanceObserver } = require('perf_hooks')
const summary = require('summary')

const ONSEND = 'on-send-'
const PREHANDLER = 'pre-handler-'
const ROUTES = 'fastify-routes:'

module.exports = fp(async function (fastify, opts) {
  let observedEntries = {}
  const obs = new PerformanceObserver((items) => {
    const fetchedItems = items.getEntries()
    for (let i = 0; i < fetchedItems.length; i++) {
      const e = fetchedItems[i]
      if (e.name.indexOf(ROUTES) === 0) {
        const key = e.name.split(':')[1]
        if (observedEntries[key]) {
          observedEntries[key].push(e.duration)
        } else {
          observedEntries[key] = [e.duration]
        }
      }
    }

    performance.clearMarks()
  })
  obs.observe({ entryTypes: ['measure'] })

  fastify.addHook('preHandler', function (request, reply, next) {
    const id = request.raw.id
    performance.mark(PREHANDLER + id)
    next()
  })

  fastify.addHook('onSend', function (request, reply, _, next) {
    let routeId = request.raw.url
    if (reply.context.config.statsId) {
      routeId = reply.context.config.statsId
    }
    const id = request.raw.id
    performance.mark(ONSEND + id)
    performance.measure(ROUTES + routeId, PREHANDLER + id, ONSEND + id)

    performance.clearMarks(ONSEND + id)
    performance.clearMarks(PREHANDLER + id)

    next()
  })

  fastify.decorate('measurements', measurements)
  fastify.decorate('stats', stats)

  const interval = setInterval(() => fastify.log.info({ stats: stats() }, 'routes stats'), 30000)
  interval.unref()

  fastify.onClose(function () {
    clearInterval(interval)
    obs.disconnect()
    observedEntries = {}
  })

  function measurements () {
    // observedEntries built in PerformanceObserver
    return observedEntries
  }

  function stats () {
    const m = measurements()
    observedEntries = {}

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
})
