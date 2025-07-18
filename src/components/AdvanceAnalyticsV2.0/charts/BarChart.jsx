import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

/**
 * BarChart component renders a bart chart using Plotly.js.
 *
 * @param {Object} data - The data to be plotted. An array of objects. Each object represents a data point.
 * @param {string} xKey - The key in the data objects to be used for the x-axis values.
 * @param {string} yKey - The key in the data objects to be used for the y-axis values.
 * @param {string} colorKey - The key in the data objects to be used for determining the color of the bars.
 * @param {Object} colorMap - An object mapping categories (colorKey values) to colors.
 * @param {string} hovertemplate - A template for the hover text.
 * @param {string} xAxisTitle - The title for the x-axis.
 * @param {string} yAxisTitle - The title for the y-axis.
 *
 * @returns The rendered Plotly bar chart.
 */
const BarChart = ({
  data, xKey, yKey, colorKey, colorMap, hovertemplate, xAxisTitle, yAxisTitle, onClick, chartId,
}) => {
  const categories = Object.keys(colorMap).sort();

  const traces = useMemo(() => categories.map(category => {
    const filteredData = data.filter(item => item[colorKey] === category);
    return {
      chartId,
      x: filteredData.map(item => item[xKey]),
      y: filteredData.map(item => item[yKey]),
      type: 'bar',
      name: category,
      marker: { color: colorMap[category] },
      hovertemplate,
    };
  }), [data, xKey, yKey, colorKey, colorMap, hovertemplate, categories, chartId]);

  const layout = {
    margin: { t: 0 },
    legend: {
      title: '', yanchor: 'top', y: 0.99, xanchor: 'right', x: 0.99, bgcolor: 'white',
    },
    xaxis: { title: xAxisTitle },
    yaxis: { title: yAxisTitle },
    dragmode: false,
    barmode: 'stack',
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
      onClick={onClick}
    />
  );
};

BarChart.defaultProps = {
  xAxisTitle: '',
};

BarChart.propTypes = {
  chartId: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
  colorKey: PropTypes.string.isRequired,
  colorMap: PropTypes.objectOf(PropTypes.string).isRequired,
  hovertemplate: PropTypes.string.isRequired,
  xAxisTitle: PropTypes.string,
  yAxisTitle: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default BarChart;
