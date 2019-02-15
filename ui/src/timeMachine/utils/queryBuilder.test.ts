import {buildQuery} from 'src/timeMachine/utils/queryBuilder'

import {BuilderConfig, TimeRange} from 'src/types/v2'

describe('buildQuery', () => {
  test('single tag', () => {
    const config: BuilderConfig = {
      buckets: ['b0'],
      tags: [{key: '_measurement', values: ['m0']}],
      functions: [],
    }
    const timeRange: TimeRange = {lower: 'now - 1h'}

    const expected = `from(bucket: "b0")
  |> range(start: timeRangeStart)
  |> filter(fn: (r) => r._measurement == "m0")`

    const actual = buildQuery(config, timeRange)

    expect(actual).toEqual(expected)
  })

  test('multiple tags', () => {
    const config: BuilderConfig = {
      buckets: ['b0'],
      tags: [
        {key: '_measurement', values: ['m0', 'm1']},
        {key: '_field', values: ['f0', 'f1']},
      ],
      functions: [],
    }
    const timeRange: TimeRange = {lower: 'now - 1h'}

    const expected = `from(bucket: "b0")
  |> range(start: timeRangeStart)
  |> filter(fn: (r) => r._measurement == "m0" or r._measurement == "m1")
  |> filter(fn: (r) => r._field == "f0" or r._field == "f1")`

    const actual = buildQuery(config, timeRange)

    expect(actual).toEqual(expected)
  })

  test('single tag, multiple functions', () => {
    const config: BuilderConfig = {
      buckets: ['b0'],
      tags: [{key: '_measurement', values: ['m0']}],
      functions: [{name: 'mean'}, {name: 'median'}],
    }
    const timeRange: TimeRange = {lower: 'now - 1h'}

    const expected = `from(bucket: "b0")
  |> range(start: timeRangeStart)
  |> filter(fn: (r) => r._measurement == "m0")
  |> window(period: windowPeriod)
  |> mean()
  |> group(columns: ["_value", "_time", "_start", "_stop"], mode: "except")
  |> yield(name: "mean")

from(bucket: "b0")
  |> range(start: timeRangeStart)
  |> filter(fn: (r) => r._measurement == "m0")
  |> window(period: windowPeriod)
  |> toFloat()
  |> median()
  |> group(columns: ["_value", "_time", "_start", "_stop"], mode: "except")
  |> yield(name: "median")`

    const actual = buildQuery(config, timeRange)

    expect(actual).toEqual(expected)
  })

  test('time range with upper bound', () => {
    const config: BuilderConfig = {
      buckets: ['b0'],
      tags: [{key: '_measurement', values: ['m0']}],
      functions: [],
    }
    const timeRange: TimeRange = {
      lower: '2019-02-13T18:14:14.000Z',
      upper: '2019-02-15T18:14:14.038Z',
    }

    const expected = `from(bucket: "b0")
  |> range(start: timeRangeStart, stop: timeRangeStop)
  |> filter(fn: (r) => r._measurement == "m0")`

    const actual = buildQuery(config, timeRange)

    expect(actual).toEqual(expected)
  })
})
