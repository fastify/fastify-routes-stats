'use strict'

const fp = require('fastify-plugin')
const { performance, PerformanceObserver } = require('perf_hooks')
const processPerformanceList = require('./lib/processPerformanceList')

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

    clearPerformance()
  })

  // Node 14 does not have clearMeasures but Node 16 and above need it to avoid
  // a memory leak.
  /* istanbul ignore next */
  const clearPerformance = performance.clearMeasures
    ? () => {
        performance.clearMarks()
        performance.clearMeasures()
      }
    : () => {
        /* istanbul ignore next */
        performance.clearMarks()
      }

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
    try {
      performance.measure(key, ONREQUEST + id, ONSEND + id)
    } catch (e) {
      fastify.log.error('missing request mark')
    }
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

        method in results || (results[method] = {})

        results[method][route] = processPerformanceList(m[method][route])
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
