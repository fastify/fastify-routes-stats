'use strict'

const Fastify = require('fastify')
const fastify = Fastify({
  logger: true
})

fastify.register(require('..'))

fastify.get('/', function (_request, reply) {
  reply.send({ hello: 'world' })
})

fastify.post('/', function (_request, reply) {
  reply.send({ hello: 'world', POST: true })
})

fastify.get('/:param/dynamic-route-example', { config: { statsId: 'group-stats-together' } }, function (_request, reply) {
  reply.send({ hello: 'world' })
})

fastify.get('/__stats__', function (_request, reply) {
  reply.send(this.stats())
})

fastify.listen({ port: 3000 })
