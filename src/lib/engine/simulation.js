import * as _collections from './collections'
import {orArr} from './utils'

import {sampleMean, sampleStdev, percentile, cutoff, sortDescending} from 'lib/dataAnalysis.js'
import * as errorTypes from 'lib/propagation/errors'

const {
  ERROR_TYPES: {WORKER_ERROR},
  ERROR_SUBTYPES: { GRAPH_ERROR_SUBTYPES: {IN_INFINITE_LOOP, INVALID_ANCESTOR_ERROR} },
} = errorTypes

export const NUM_SAMPLES = 5000, METRIC_ID_PREFIX = 'metric:', FACT_ID_PREFIX = 'fact:'

const someOfSubType = _.partialRight(_collections.some, 'subType')
const getBySubType = _.partialRight(_collections.get, 'subType')
export const isBreak = _.partialRight(someOfSubType, INVALID_ANCESTOR_ERROR)
export const isInfiniteLoop = _.partialRight(someOfSubType, IN_INFINITE_LOOP)
export const hasInputError = _.partialRight(someOfSubType, INVALID_ANCESTOR_ERROR)
export const displayableError = errors => hasInputError(errors) ? getBySubType(errors, INVALID_ANCESTOR_ERROR) : errors.find(e => e.type !== WORKER_ERROR)

export const getByMetricFn = graph => _collections.getFn(_.get(graph, 'simulations'), 'metric', 'metric')

export function addStats(simulation){
  if (!_.has(simulation, 'sample.values.length') || (simulation.sample.values.length === 0)) {
    return
  }

  const sortedValues = sortDescending(simulation.sample.values)
  if (sortedValues[sortedValues.length - 1] - sortedValues[0] < 1e-15) {
    let numDistinctNums = 0
    let index = 0

    while (index != -1) {
      numDistinctNums++
      index = sortedValues.findIndex((e, i) => i > index && e !== sortedValues[index])
    }

    if (numDistinctNums < 10) {
      simulation.sample.values = simulation.sample.values.slice(0,1)
    }
  }

  if (simulation.sample.values.length === 1) {
    simulation.stats = {
      mean: simulation.sample.values[0],
      stdev: 0,
      length: 1,
    }
    simulation.sample.sortedValues = simulation.sample.values
    return
  }

  const length = sortedValues.length
  const mean = sampleMean(sortedValues)
  const meanIndex = cutoff(sortedValues, length, mean)
  const stdev = sampleStdev(sortedValues)
  const percentiles = {
    5: percentile(sortedValues, length, 5),
    50: percentile(sortedValues, length, 50),
    95: percentile(sortedValues, length, 95),
  }
  const adjustedLow = percentile(sortedValues, meanIndex, 10)
  const adjustedHigh = percentile(sortedValues.slice(meanIndex), length - meanIndex, 90)

  const stats = {
    mean,
    stdev,
    length,
    percentiles,
    adjustedConfidenceInterval: [adjustedLow, adjustedHigh]
  }
  simulation.sample.sortedValues = sortedValues
  simulation.stats = stats
}

export const hasErrors = simulation => errors(simulation).length > 0
export const errors = simulation => orArr(_.get(simulation, 'sample.errors'))
export const values = simulation => orArr(_.get(simulation, 'sample.values'))
