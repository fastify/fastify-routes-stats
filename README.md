# fastify-routes-stats

[![Greenkeeper badge](https://badges.greenkeeper.io/fastify/fastify-routes-stats.svg)](https://greenkeeper.io/) [![Node.js CI](https://github.com/fastify/fastify-routes-stats/workflows/Node.js%20CI/badge.svg)](https://github.com/fastify/fastify-routes-stats/actions)

Provide stats for routes using `require('perf_hooks')`, for **Fastify**.

## Install

```sh
npm i fastify-routes-stats
```

## Example

```js
'use strict'

const Fastify = require('fastify')
const fastify = Fastify()

fastify.register(require('.'))

fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.get(
  '/:param/dynamic-route-example',
  { config: { statsId: 'group-stats-together' } },
  function (request, reply) {
    reply.send({ hello: 'world' })
  }
)

fastify.get('/__stats__', async function () {
  // stats is added to the fastify instance
  return this.stats()
})

// To group all methods of a route together:
//   mergeMethods: true
fastify.get('/mergeMethods', { config: { mergeMethods: true } }, function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.post('/mergeMethods', { config: { mergeMethods: true } }, function (request, reply) {
  reply.send({ hello: 'world', POST: true })
})

fastify.listen(3000)
```

```sh
$ curl -s localhost:3000/__stats__ | jsonlint
{
  "All Methods": {
    "/mergeMethods": {
      "mean": 0.09750119999999998,
      "mode": 0.310097,
      "median": 0.049117499999999994,
      "max": 0.310097,
      "min": 0.044229,
      "sd": 0.08820506012796418
    }
  },
  "GET": {
    "/": {
      "mean": 0.2406786,
      "mode": 0.755647,
      "median": 0.121999,
      "max": 0.755647,
      "min": 0.050214,
      "sd": 0.2905856386253457
    }
  },
  "POST": {
    "/": {
      "mean": 0.11260519999999999,
      "mode": 0.292262,
      "median": 0.055179,
      "max": 0.292262,
      "min": 0.044159,
      "sd": 0.10438752062722824
    }
  }
}
```

It will also log a stat object every 30 seconds.

## License

MIT
