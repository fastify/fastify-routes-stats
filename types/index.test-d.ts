import Fastify from 'fastify'
import { expectAssignable, expectError, expectType } from 'tsd'
import fastifyRoutesStats from '..'

const fastify = Fastify()

fastify.register(fastifyRoutesStats, { printInterval: 1000 })
expectError(fastify.register(fastifyRoutesStats, { printInterval: 'a' }))

fastify.register(fastifyRoutesStats, { decoratorName: 'perfMarker' })
expectError(fastify.register(fastifyRoutesStats, { decoratorName: 1 }))

expectAssignable<Function>(fastify.measurements)
expectAssignable<Function>(fastify.stats)

fastify.get('/stats', function (req, reply) {
  expectAssignable<Function>(this.measurements)
  expectAssignable<Function>(this.stats)
})

expectType<Array<number>>(fastify.measurements().GET!['test'])
expectAssignable<Record<string, {}> | undefined>(fastify.stats().GET)
expectType<number>(fastify.stats().GET!['/'].max)
expectType<number>(fastify.stats().GET!['/'].mean)
expectType<number>(fastify.stats().GET!['/'].median)
expectType<number>(fastify.stats().GET!['/'].min)
expectType<number>(fastify.stats().GET!['/'].mode)
expectType<number>(fastify.stats().GET!['/'].sd)
