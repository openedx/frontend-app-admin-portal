import React from 'react';
import PropTypes from 'prop-types';
import ProgressOverlay from '../ProgressOverlay';
import ScatterChart from './ScatterChart';
import LineChart from './LineChart';
import BarChart from './BarChart';

const ChartWrapper = ({
  isLoading,
  isError,
  chartType,
  chartProps,
  loadingMessage,
}) => {
  if (isLoading || isError) {
    return (
      <ProgressOverlay
        isError={isError}
        message={loadingMessage}
      />
    );
  }

  const renderChart = () => {
    const chartMap = {
      ScatterChart: <ScatterChart {...chartProps} />,
      LineChart: <LineChart {...chartProps} />,
      BarChart: <BarChart {...chartProps} />,
    };

    return chartMap[chartType];
  };

  return renderChart();
};

ChartWrapper.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  chartType: PropTypes.oneOf(['ScatterChart', 'LineChart', 'BarChart']).isRequired,
  chartProps: PropTypes.object.isRequired,
  loadingMessage: PropTypes.string.isRequired,
};

export default ChartWrapper;
