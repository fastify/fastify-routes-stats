import Fastify from 'fastify'
import { expect } from 'tstyche'
import fastifyRoutesStats from '.'

const fastify = Fastify()

fastify.register(fastifyRoutesStats, { printInterval: 1000 })

// @ts-expect-error: Type 'string' is not assignable to type 'number'
fastify.register(fastifyRoutesStats, { printInterval: 'a' })

fastify.register(fastifyRoutesStats, { decoratorName: 'perfMarker' })

// @ts-expect-error: Type 'number' is not assignable to type 'string'
fastify.register(fastifyRoutesStats, { decoratorName: 1 })

expect(fastify.measurements).type.toBeAssignableTo<Function>()
expect(fastify.stats).type.toBeAssignableTo<Function>()

fastify.get('/stats', function () {
  expect(this.measurements).type.toBeAssignableTo<Function>()
  expect(this.stats).type.toBeAssignableTo<Function>()
})

expect(fastify.measurements().GET!['test']).type.toBe<Array<number> | undefined>()
expect(fastify.stats().GET).type.toBeAssignableTo<Record<string, any> | undefined>()

const getStats = fastify.stats().GET!['/']!

expect(getStats.max).type.toBe<number>()
expect(getStats.mean).type.toBe<number>()
expect(getStats.median).type.toBe<number>()
expect(getStats.min).type.toBe<number>()
expect(getStats.mode).type.toBe<number>()
expect(getStats.sd).type.toBe<number>()
