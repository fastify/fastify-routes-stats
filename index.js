'use strict'

const fp = require('fastify-plugin')
const { performance, PerformanceObserver } = require('perf_hooks')
const summary = require('summary')

const ONSEND = 'on-send-'
const ONREQUEST = 'on-request-'
const ROUTES = 'fastify-routes:'

async function fastifyRoutesStats (fastify, opts) {
  let observedEntries = {}
  const obs = new PerformanceObserver((items) => {
    const fetchedItems = items.getEntries()
    for (let i = 0, il = fetchedItems.length; i < il; ++i) {
      const e = fetchedItems[i]
      if (e.name.startsWith(ROUTES)) {
        const [
          method,
          route
        ] = e.name.split(':')[1].split('|')
        if (
          method in observedEntries &&
          route in observedEntries[method]
        ) {
          observedEntries[method][route].push(e.duration)
        } else {
          method in observedEntries || (observedEntries[method] = {})
          observedEntries[method][route] = [e.duration]
        }
      }
    }

    performance.clearMarks()
  })
  obs.observe({ entryTypes: ['measure'], buffered: true })

  fastify.addHook('onRequest', function (request, reply, next) {
    const id = request.raw.id
    performance.mark(ONREQUEST + id)
    next()
  })

  fastify.addHook('onSend', function (request, reply, _, next) {
    const routeId = reply.context.config.statsId
      ? reply.context.config.statsId
      : request.raw.url

    const id = request.raw.id
    performance.mark(ONSEND + id)

    const key = `${ROUTES}${request.raw.method}|${routeId}`
    performance.measure(key, ONREQUEST + id, ONSEND + id)

    performance.clearMarks(ONSEND + id)
    performance.clearMarks(ONREQUEST + id)

    next()
  })

  fastify.decorate('measurements', measurements)
  fastify.decorate('stats', stats)

  const interval = setInterval(() => {
    fastify.log.info({ stats: stats() }, 'routes stats')
  }, opts.printInterval || 30000)
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
    const results = {}

    const methods = Object.keys(m)
    for (let i = 0, il = methods.length; i < il; ++i) {
      const method = methods[i]
      const routes = Object.keys(m[method])
      for (let j = 0, jl = routes.length; j < jl; ++j) {
        const route = routes[j]
        const s = summary(m[method][route])

        method in results || (results[method] = {})

        results[method][route] = {
          mean: s.mean(),
          mode: s.mode(),
          median: s.median(),
          max: s.max(),
          min: s.min(),
          sd: s.sd()
        }
      }
    }
    return results
  }
}

module.exports = fp(fastifyRoutesStats, {
  fastify: '4.x',
  name: '@fastify/routes-stats'
})
module.exports.default = fastifyRoutesStats
module.exports.fastifyRoutesStats = fastifyRoutesStats
