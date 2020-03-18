'use strict'

const Fastify = require('fastify')
const fastify = Fastify({
  logger: true
})

fastify.register(require('.'))

fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.post('/', function (request, reply) {
  reply.send({ hello: 'world', POST: true })
})

fastify.get('/:param/dynamic-route-example', { config: { statsId: 'group-stats-together' } }, function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.get('/__stats__', function (request, reply) {
  reply.send(this.stats())
})

fastify.listen(3000)
