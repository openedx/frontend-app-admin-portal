import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { useIntl } from '@edx/frontend-platform/i18n';

const EmptyChart = ({ message }) => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'advance.analytics.empty.chart.message',
    defaultMessage: 'No matching data found',
    description: 'Empty chart message',
  });
  const chartMessage = message || defaultMessage;

  const layout = {
    annotations: [
      {
        text: chartMessage,
        xref: 'paper',
        yref: 'paper',
        showarrow: false,
        font: {
          size: 20,
          color: '#333333',
        },
        x: 0.5,
        y: 0.5,
        xanchor: 'center',
        yanchor: 'middle',
      },
    ],
    xaxis: { visible: false },
    yaxis: { visible: false },
    margin: {
      t: 0, b: 0, l: 0, r: 0,
    },
    paper_bgcolor: 'lightgray',
    plot_bgcolor: 'lightgray',
    autosize: true,
  };

  const config = {
    displayModeBar: false,
  };

  return <Plot data={[]} layout={layout} config={config} style={{ width: '100%', height: '100%' }} />;
};

EmptyChart.defaultProps = {
  message: undefined,
};

EmptyChart.propTypes = {
  message: PropTypes.string,
};

export default EmptyChart;
