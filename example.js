'use strict'

const Fastify = require('fastify')
const fastify = Fastify()

fastify.register(require('.'))

fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.get('/__stats__', function (request, reply) {
  reply.send(this.stats())
})

fastify.listen(3000)
