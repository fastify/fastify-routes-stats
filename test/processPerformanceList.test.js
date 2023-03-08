'use strict'

const { test } = require('tap')
const processPerformanceList = require('../lib/processPerformanceList')

test('processPerformanceList', t => {
  t.plan(8)

  t.test('no entries', t => {
    t.plan(6)
    t.equal(
      processPerformanceList([]).mean,
      undefined
    )
    t.equal(
      processPerformanceList([]).mode,
      undefined
    )
    t.equal(
      processPerformanceList([]).median,
      undefined
    )
    t.equal(
      processPerformanceList([]).max,
      undefined
    )
    t.equal(
      processPerformanceList([]).min,
      undefined
    )
    t.equal(
      processPerformanceList([]).sd,
      undefined
    )
  })

  t.test('one entry', t => {
    t.plan(6)
    t.equal(
      processPerformanceList([2]).mean,
      2
    )
    t.equal(
      processPerformanceList([2]).mode,
      2
    )
    t.equal(
      processPerformanceList([2]).median,
      2
    )
    t.equal(
      processPerformanceList([2]).max,
      2
    )
    t.equal(
      processPerformanceList([2]).min,
      2
    )
    t.equal(
      processPerformanceList([2]).sd,
      0
    )
  })

  t.test('mode', t => {
    t.plan(6)
    t.equal(
      processPerformanceList([10, 11, 12, 11, 12, 7, 12]).mode,
      12
    )

    t.equal(
      processPerformanceList([10, 13, 12, 13, 12, 13, 12]).mode,
      13
    )

    t.equal(
      processPerformanceList([1, 2, 2, 3, 3, 3, 4]).mode,
      3
    )

    t.equal(
      processPerformanceList([1, 2, 2, 3, 3, 4]).mode,
      3
    )

    t.equal(
      processPerformanceList([1, 2, 2, 2, 3, 3, 4]).mode,
      2
    )

    t.equal(
      processPerformanceList([1, 2, 3]).mode,
      3
    )
  })

  t.test('mean', t => {
    t.plan(6)
    t.equal(
      processPerformanceList([10, 11, 12, 11, 12, 7, 12]).mean,
      75 / 7
    )

    t.equal(
      processPerformanceList([10, 13, 12, 13, 12, 13, 12]).mean,
      85 / 7
    )

    t.equal(
      processPerformanceList([1, 2, 2, 3, 3, 3, 4]).mean,
      18 / 7
    )

    t.equal(
      processPerformanceList([1, 2, 2, 3, 3, 4]).mean,
      2.5
    )

    t.equal(
      processPerformanceList([1, 2, 2, 2, 3, 3, 4]).mean,
      17 / 7
    )

    t.equal(
      processPerformanceList([1, 2, 3]).mean,
      2
    )
  })

  t.test('median', t => {
    t.plan(3)

    t.equal(
      processPerformanceList([1, 2]).median,
      1.5
    )

    t.equal(
      processPerformanceList([1, 2, 3]).median,
      2
    )

    t.equal(
      processPerformanceList([
        2, 27, 10, 29, 16, 8, 5, 19, 2, 2, 18, 28,
        7, 28, 28, 25, 19, 14, 18, 21, 25, 29, 7,
        3, 21, 3, 24, 18, 12, 25
      ]).median,
      18
    )
  })

  t.test('standard deviation', t => {
    t.plan(1)
    t.equal(processPerformanceList([-2, -1, 0, 1, 2]).sd, Math.sqrt(2.5))
  })

  t.test('max', t => {
    t.plan(2)
    t.equal(processPerformanceList([-2, -1, 0, 1, 2]).max, 2)
    t.equal(processPerformanceList([6, 10, 2, 5]).max, 10)
  })

  t.test('min', t => {
    t.plan(2)
    t.equal(processPerformanceList([-2, -1, 0, 1, 2]).min, -2)
    t.equal(processPerformanceList([6, 10, 2, 5]).min, 2)
  })
})
