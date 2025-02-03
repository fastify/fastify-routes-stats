'use strict'

const { test } = require('node:test')
const processPerformanceList = require('../lib/processPerformanceList')

test('processPerformanceList', async t => {
  t.plan(8)

  await t.test('no entries', t => {
    t.plan(6)
    t.assert.strictEqual(
      processPerformanceList([]).mean,
      undefined
    )
    t.assert.strictEqual(
      processPerformanceList([]).mode,
      undefined
    )
    t.assert.strictEqual(
      processPerformanceList([]).median,
      undefined
    )
    t.assert.strictEqual(
      processPerformanceList([]).max,
      undefined
    )
    t.assert.strictEqual(
      processPerformanceList([]).min,
      undefined
    )
    t.assert.strictEqual(
      processPerformanceList([]).sd,
      undefined
    )
  })

  await t.test('one entry', t => {
    t.plan(6)
    t.assert.strictEqual(
      processPerformanceList([2]).mean,
      2
    )
    t.assert.strictEqual(
      processPerformanceList([2]).mode,
      2
    )
    t.assert.strictEqual(
      processPerformanceList([2]).median,
      2
    )
    t.assert.strictEqual(
      processPerformanceList([2]).max,
      2
    )
    t.assert.strictEqual(
      processPerformanceList([2]).min,
      2
    )
    t.assert.strictEqual(
      processPerformanceList([2]).sd,
      0
    )
  })

  await t.test('mode', t => {
    t.plan(6)
    t.assert.strictEqual(
      processPerformanceList([10, 11, 12, 11, 12, 7, 12]).mode,
      12
    )

    t.assert.strictEqual(
      processPerformanceList([10, 13, 12, 13, 12, 13, 12]).mode,
      13
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 3, 3, 3, 4]).mode,
      3
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 3, 3, 4]).mode,
      3
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 2, 3, 3, 4]).mode,
      2
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 3]).mode,
      3
    )
  })

  await t.test('mean', t => {
    t.plan(6)
    t.assert.strictEqual(
      processPerformanceList([10, 11, 12, 11, 12, 7, 12]).mean,
      75 / 7
    )

    t.assert.strictEqual(
      processPerformanceList([10, 13, 12, 13, 12, 13, 12]).mean,
      85 / 7
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 3, 3, 3, 4]).mean,
      18 / 7
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 3, 3, 4]).mean,
      2.5
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 2, 2, 3, 3, 4]).mean,
      17 / 7
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 3]).mean,
      2
    )
  })

  await t.test('median', t => {
    t.plan(3)

    t.assert.strictEqual(
      processPerformanceList([1, 2]).median,
      1.5
    )

    t.assert.strictEqual(
      processPerformanceList([1, 2, 3]).median,
      2
    )

    t.assert.strictEqual(
      processPerformanceList([
        2, 27, 10, 29, 16, 8, 5, 19, 2, 2, 18, 28,
        7, 28, 28, 25, 19, 14, 18, 21, 25, 29, 7,
        3, 21, 3, 24, 18, 12, 25
      ]).median,
      18
    )
  })

  await t.test('standard deviation', t => {
    t.plan(1)
    t.assert.strictEqual(processPerformanceList([-2, -1, 0, 1, 2]).sd, Math.sqrt(2.5))
  })

  await t.test('max', t => {
    t.plan(2)
    t.assert.strictEqual(processPerformanceList([-2, -1, 0, 1, 2]).max, 2)
    t.assert.strictEqual(processPerformanceList([6, 10, 2, 5]).max, 10)
  })

  await t.test('min', t => {
    t.plan(2)
    t.assert.strictEqual(processPerformanceList([-2, -1, 0, 1, 2]).min, -2)
    t.assert.strictEqual(processPerformanceList([6, 10, 2, 5]).min, 2)
  })
})
