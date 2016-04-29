import React, {Component, PropTypes} from 'react'
import Histogram from 'gComponents/simulations/histogram'
import MetricName from '../name'
import DistributionSummary from 'gComponents/distributions/summary/index.js'
import StatTable from 'gComponents/simulations/stat_table'
import JSONTree from 'react-json-tree'
import MetricToken from '../token/index.js'
import './style.css'
import Icon from 'react-fa'

const isBreak = (errors) => {return errors[0] && (errors[0] === 'BROKEN_UPSTREAM' || errors[0] === 'BROKEN_INPUT' )}

// We have to display this section after it disappears
// to ensure that the metric card gets selected after click.
const ErrorSection = ({errors, padTop, hide}) => (
  <div className={`StatsSectionErrors ${isBreak(errors) ? 'minor' : 'serious'} ${padTop ? 'padTop' : ''} ${hide ? 'isHidden' : ''}`}>
    {isBreak(errors) && <Icon name='unlink'/>}
    {!isBreak(errors) && <Icon name='warning'/>}
  </div>
)

export default class MetricCardViewSection extends Component {

  hasContent() {
    return _.has(this, 'refs.name') && this.refs.name.hasContent()
  }

  showSimulation() {
    const stats = _.get(this.props, 'metric.simulation.stats')
    if (stats && _.isFinite(stats.mean) && _.isFinite(stats.stdev) && _.isFinite(stats.length)) {
      return (stats.stdev === 0 || (stats.length > 5))
    } else {
      return false
    }
  }

  _shouldShowStatistics() {
    const isScientific = (this.props.canvasState.metricCardView === 'scientific')
    const isAvailable = this.showSimulation() && (_.get(this.props, 'metric.simulation.stats').length > 1)
    return isScientific && isAvailable
  }

  _errors() {
    if (this.props.isTitle){ return [] }
    let errors = _.get(this.props.metric, 'simulation.sample.errors')
    return errors ? errors.filter(e => !!e) : []
  }

  render() {
    const {canvasState,
          metric,
          isSelected,
          onChangeName,
          guesstimateForm,
          onOpenModal,
          jumpSection,
          onClick
    } = this.props

    const errors = this._errors()
    const {canvasState: {metricCardView, metricClickMode}} = this.props
    const {guesstimate} = metric
    const showSimulation = this.showSimulation()
    const shouldShowStatistics = this._shouldShowStatistics()
    const shouldShowJsonTree = (metricCardView === 'debugging')
    const hasGuesstimateDescription = !_.isEmpty(guesstimate.description)
    const anotherFunctionSelected = ((metricClickMode === 'FUNCTION_INPUT_SELECT') && !isSelected)
    const hasErrors = (errors.length > 0)

    return(
      <div className={`MetricCardViewSection ${metricCardView} ${(hasErrors & !isSelected) ? 'hasErrors' : ''}`}
          onMouseDown={onClick}
      >
        {(metricCardView !== 'basic') && showSimulation &&
          <Histogram height={(metricCardView === 'scientific') ? 110 : 30}
              simulation={metric.simulation}
              cutOffRatio={0.995}
          />
        }

        <div className='MetricTokenSection'>
          <MetricToken
           readableId={metric.readableId}
           anotherFunctionSelected={anotherFunctionSelected}
           onOpenModal={onOpenModal}
           hasGuesstimateDescription={hasGuesstimateDescription}
          />
        </div>

        {(!_.isEmpty(metric.name) || isSelected) &&
          <div className='NameSection'>
              <MetricName
                isSelected={isSelected}
                name={metric.name}
                onChange={onChangeName}
                jumpSection={jumpSection}
                ref='name'
              />
          </div>
        }

        <div className='StatsSection'>
          {showSimulation &&
            <div className='StatsSectionBody'>
              <DistributionSummary
                  guesstimateForm={guesstimateForm}
                  simulation={metric.simulation}
              />
            </div>
          }

          {hasErrors &&
            <ErrorSection
              errors={errors}
              padTop={(!_.isEmpty(metric.name) && !isSelected)}
              hide={isSelected}
            />
          }
        </div>

        {shouldShowJsonTree &&
          <div className='row'> <div className='col-xs-12'> <JSONTree data={this.props}/> </div> </div>
        }
        {shouldShowStatistics &&
          <div className='row'> <div className='col-xs-12'> <StatTable stats={metric.simulation.stats}/> </div> </div>
        }
      </div>
    )
  }
}
