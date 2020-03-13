# fastify-routes-stats

[![Greenkeeper badge](https://badges.greenkeeper.io/fastify/fastify-routes-stats.svg)](https://greenkeeper.io/) [![Node.js CI](https://github.com/davealbert/fastify-routes-stats/workflows/Node.js%20CI/badge.svg)](https://github.com/davealbert/fastify-routes-stats/actions)

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

fastify.listen(3000)
```

```sh
$ curl localhost:3000/__stats__ | jsonlint
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   232  100   232    0     0  38906      0 --:--:-- --:--:-- --:--:-- 46400
{
  "/__stats__": {
    "mean": 0.6234458,
    "mode": 1.112343,
    "median": 0.760182,
    "max": 1.112343,
    "min": 0.123645,
    "sd": 0.461611690848163
  },
  "/": {
    "mean": 0.092497,
    "mode": 0.146983,
    "median": 0.077823,
    "max": 0.146983,
    "min": 0.052685,
    "sd": 0.048831576955900166
  },
  "group-stats-together": {
    "mean": 0.07447716666666666,
    "mode": 0.102686,
    "median": 0.07249649999999999,
    "max": 0.102686,
    "min": 0.051836,
    "sd": 0.01924915148692707
  }
}
```

It will also log a stat object every 30 seconds.

## License

MIT
