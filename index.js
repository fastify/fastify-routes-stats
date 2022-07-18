'use strict'

const fp = require('fastify-plugin')
const { performance, PerformanceObserver } = require('perf_hooks')
const summary = require('summary')

const ONSEND = 'on-send-'
const ONREQUEST = 'on-request-'
const ROUTES = 'fastify-routes:'

module.exports = fp(async function (fastify, opts) {
  let observedEntries = {}
  const obs = new PerformanceObserver((items) => {
    const fetchedItems = items.getEntries()
    for (let i = 0; i < fetchedItems.length; i++) {
      const e = fetchedItems[i]
      if (e.name.indexOf(ROUTES) === 0) {
        const method = e.name.split(':')[1].split('|')[0]
        const route = e.name.split(':')[1].split('|')[1]
        if (observedEntries[method] && observedEntries[method][route]) {
          observedEntries[method][route].push(e.duration)
        } else {
          if (!observedEntries[method]) {
            observedEntries[method] = {}
          }
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
    let routeId = request.raw.url
    if (reply.context.config.statsId) {
      routeId = reply.context.config.statsId
    }

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
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i]
      const routes = Object.keys(m[method])
      for (let j = 0; j < routes.length; j++) {
        const route = routes[j]
        const s = summary(m[method][route])

        if (!results[method]) {
          results[method] = {}
        }

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
}, {
  fastify: '4.x',
  name: '@fastify/route-stats'
})
