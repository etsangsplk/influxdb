// Libraries
import React, {PureComponent, createRef} from 'react'
import {get} from 'lodash'
import moment from 'moment'

// Components
import {Dropdown} from 'src/clockface'
import DateRangePicker from 'src/shared/components/dateRangePicker/DateRangePicker'

// Constants
import {TIME_RANGES} from 'src/shared/constants/timeRanges'

// Types
import {TimeRange} from 'src/types'

interface Props {
  timeRange: TimeRange
  onSetTimeRange: (timeRange: TimeRange) => void
}

interface State {
  isDatePickerOpen: boolean
  dropdownPosition: {top: number; right: number}
}

class TimeRangeDropdown extends PureComponent<Props, State> {
  private dropdownRef = createRef<HTMLDivElement>()

  constructor(props: Props) {
    super(props)

    this.state = {isDatePickerOpen: false, dropdownPosition: undefined}
  }

  public render() {
    const timeRange = this.timeRange

    return (
      <>
        {this.isDatePickerVisible && (
          <DateRangePicker
            timeRange={timeRange}
            onSetTimeRange={this.handleApplyTimeRange}
            onClose={this.handleHideDatePicker}
            position={this.state.dropdownPosition}
          />
        )}
        <div ref={this.dropdownRef}>
          <Dropdown
            selectedID={timeRange.label}
            onChange={this.handleChange}
            widthPixels={100}
          >
            {TIME_RANGES.map(({label}) => (
              <Dropdown.Item key={label} value={label} id={label}>
                {label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </>
    )
  }

  private get timeRange(): TimeRange {
    const {timeRange} = this.props
    const {isDatePickerOpen} = this.state

    if (isDatePickerOpen) {
      const date = new Date().toISOString()
      return {
        label: 'Date Picker',
        lower: date,
        upper: date,
      }
    }

    if (
      get(timeRange, 'label', '') === 'Date Picker' ||
      timeRange.upper ||
      moment(timeRange.lower).isValid()
    ) {
      return {
        ...timeRange,
        label: `${timeRange.lower} - ${timeRange.upper}`,
      }
    }

    const selectedTimeRange = TIME_RANGES.find(t => t.lower === timeRange.lower)

    if (!selectedTimeRange) {
      throw new Error('TimeRangeDropdown passed unknown TimeRange')
    }

    return selectedTimeRange
  }

  private get isDatePickerVisible() {
    return this.state.isDatePickerOpen
  }

  private handleApplyTimeRange = (timeRange: TimeRange) => {
    this.props.onSetTimeRange(timeRange)
    this.handleHideDatePicker()
  }

  private handleHideDatePicker = () => {
    this.setState({isDatePickerOpen: false, dropdownPosition: null})
  }

  private handleChange = (label: string): void => {
    const {onSetTimeRange} = this.props
    const timeRange = TIME_RANGES.find(t => t.label === label)

    if (label === 'Date Picker') {
      const {top, left} = this.dropdownRef.current.getBoundingClientRect()
      const right = window.innerWidth - left
      this.setState({isDatePickerOpen: true, dropdownPosition: {top, right}})
      return
    }

    onSetTimeRange(timeRange)
  }
}

export default TimeRangeDropdown
