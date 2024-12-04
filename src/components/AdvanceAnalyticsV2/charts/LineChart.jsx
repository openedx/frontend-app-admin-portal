import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

/**
 * LineChart component renders a line chart using Plotly.js.
 *
 * @param {Object} data - The data to be plotted. An array of objects. Each object represents a data point.
 * @param {string} xKey - The key in the data objects to be used for the x-axis values.
 * @param {string} yKey - The key in the data objects to be used for the y-axis values.
 * @param {string} colorKey - The key in the data objects to be used for determining the color of the lines.
 * @param {Object} colorMap - An object mapping categories (colorKey values) to colors.
 * @param {string} hovertemplate - A template for the hover text.
 * @param {string} xAxisTitle - The title for the x-axis.
 * @param {string} yAxisTitle - The title for the y-axis.
 *
 * @returns The rendered Plotly line chart.
 */
const LineChart = ({
  data, xKey, yKey, colorKey, colorMap, hovertemplate, xAxisTitle, yAxisTitle,
}) => {
  const categories = Object.keys(colorMap);

  const traces = useMemo(() => categories.map(category => {
    const filteredData = data.filter(item => item[colorKey] === category);
    return {
      x: filteredData.map(item => item[xKey]),
      y: filteredData.map(item => item[yKey]),
      type: 'scatter',
      mode: 'lines',
      name: category,
      marker: { color: colorMap[category] },
      hovertemplate,
    };
  }), [data, xKey, yKey, colorKey, colorMap, hovertemplate, categories]);

  const layout = {
    margin: { t: 0 },
    legend: {
      title: '', yanchor: 'top', y: 0.99, xanchor: 'right', x: 0.99, bgcolor: 'white',
    },
    xaxis: { title: xAxisTitle },
    yaxis: { title: yAxisTitle },
    autosize: true,
  };

  const config = {
    displayModeBar: false,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

LineChart.defaultProps = {
  xAxisTitle: '',
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
  colorKey: PropTypes.string.isRequired,
  colorMap: PropTypes.objectOf(PropTypes.string).isRequired,
  hovertemplate: PropTypes.string.isRequired,
  xAxisTitle: PropTypes.string,
  yAxisTitle: PropTypes.string.isRequired,
};

export default LineChart;
