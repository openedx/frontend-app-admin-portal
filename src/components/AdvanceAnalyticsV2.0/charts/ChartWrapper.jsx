import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Spinner } from '@openedx/paragon';
import ScatterChart from './ScatterChart';
import LineChart from './LineChart';
import BarChart from './BarChart';
import TreeMap from './Treemap';
import EmptyChart from './EmptyChart';

const ChartWrapper = ({
  isFetching,
  isError,
  chartType,
  chartProps,
  loadingMessage,
}) => {
  if (isError) {
    return <EmptyChart />;
  }

  const chartMap = {
    ScatterChart: <ScatterChart {...chartProps} />,
    LineChart: <LineChart {...chartProps} />,
    BarChart: <BarChart {...chartProps} />,
    Treemap: <TreeMap {...chartProps} />,
  };

  return (
    <div id={chartProps.chartId} className={classNames('analytics-chart-container', { chartType }, { 'is-fetching': isFetching })}>
      {isFetching && (
        <div className="spinner-centered">
          <Spinner animation="border" screenReaderText={loadingMessage} />
        </div>
      )}
      {chartProps.data && chartMap[chartType]}
    </div>
  );
};

ChartWrapper.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  chartType: PropTypes.oneOf(['ScatterChart', 'LineChart', 'BarChart', 'Treemap']).isRequired,
  chartProps: PropTypes.shape({
    chartId: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    trackChartClick: PropTypes.func,
    trackCsvDownloadClick: PropTypes.func,
    xKey: PropTypes.string,
    yKey: PropTypes.string,
    colorKey: PropTypes.string,
    colorMap: PropTypes.objectOf(PropTypes.string),
    hovertemplate: PropTypes.string,
    xAxisTitle: PropTypes.string,
    yAxisTitle: PropTypes.string,
    markerSizes: PropTypes.arrayOf(PropTypes.number), // An array of sizes for the markers.
    customDataKeys: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  loadingMessage: PropTypes.string.isRequired,
};

export default ChartWrapper;
