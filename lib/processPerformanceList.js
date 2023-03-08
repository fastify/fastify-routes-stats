'use strict'

function sortFn (a, b) {
  return a - b
}

function processPerformanceList (list) {
  const length = list.length

  if (length === 0) {
    return {
      mean: undefined,
      mode: undefined,
      median: undefined,
      max: undefined,
      min: undefined,
      sd: undefined
    }
  } else if (length === 1) {
    return {
      mean: list[0],
      mode: list[0],
      median: list[0],
      max: list[0],
      min: list[0],
      sd: 0
    }
  }
  list.sort(sortFn)

  const min = list[0]
  const max = list[length - 1]

  const median = (length & 1) === 0
    ? (list[(length / 2) - 1] + list[length / 2]) / 2
    : list[(length - 1) / 2]

  // Mean
  // Numerically stable mean algorithm
  let mean = 0
  for (let i = 0; i < length; ++i) {
    mean += (list[i] - mean) / (i + 1)
  }

  // Mode
  let mode = NaN
  let modeCount = 0
  let currValue = list[0]
  let currCount = 1

  // Count the amount of repeat and update mode variables
  for (let i = 1; i < length; i++) {
    if (list[i] === currValue) {
      currCount += 1
    } else {
      if (currCount >= modeCount) {
        modeCount = currCount
        mode = currValue
      }

      currValue = list[i]
      currCount = 1
    }
  }

  // Check the last count
  currCount >= modeCount && (mode = currValue)

  // Variance
  // Numerically stable variance algorithm
  let variance = 0
  for (let i = 0; i < length; ++i) {
    const diff = list[i] - mean
    variance += (diff * diff - variance) / (i + 1)
  }

  // Debias the variance
  variance *= ((list.length) / (list.length - 1))

  return {
    mean,
    mode,
    median,
    min,
    max,
    sd: Math.sqrt(variance)
  }
}

module.exports = processPerformanceList
