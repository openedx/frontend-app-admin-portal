import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

/**
 * ScatterChart component renders a scatter chart using Plotly.js.
 *
 * @param {Object} data - The data to be plotted. An array of objects. Each object represents a data point.
 * @param {string} xKey - The key in the data objects to be used for the x-axis values.
 * @param {string} yKey - The key in the data objects to be used for the y-axis values.
 * @param {string} colorKey - The key in the data objects to be used for determining the color of the markers.
 * @param {Object} colorMap - An object mapping categories (colorKey values) to colors.
 * @param {string} hovertemplate - A template for the hover text.
 * @param {string} xAxisTitle - The title for the x-axis.
 * @param {string} yAxisTitle - The title for the y-axis.
 * @param {string} markerSizeKey - Key for the marker size values in the data objects.
 * @param {string[]} customDataKeys - Array of keys for custom data to be included in the hover template.
 *
 * @returns The rendered Plotly scatter chart.
 */
const ScatterChart = ({
  data, xKey, yKey, colorKey, colorMap, hovertemplate, xAxisTitle, yAxisTitle, markerSizeKey, customDataKeys,
}) => {
  const categories = Object.keys(colorMap);

  const traces = useMemo(() => categories.map(category => {
    const filteredData = data.filter(item => item[colorKey] === category);
    return {
      x: filteredData.map(item => item[xKey]),
      y: filteredData.map(item => item[yKey]),
      type: 'scatter',
      mode: 'markers',
      name: category,
      marker: {
        color: colorMap[category],
        size: filteredData.map(item => item[markerSizeKey] * 0.015).map(size => (size < 5 ? size + 6 : size)),
      },
      customdata: customDataKeys.length ? filteredData.map(item => customDataKeys.map(key => item[key])) : [],
      hovertemplate,
    };
  }), [data, xKey, yKey, colorKey, colorMap, hovertemplate, categories, markerSizeKey, customDataKeys]);

  const layout = {
    margin: { t: 0 },
    legend: {
      title: '', yanchor: 'top', y: 0.99, xanchor: 'left', x: 0.99, bgcolor: 'white', itemsizing: 'constant',
    },
    yaxis: {
      title: yAxisTitle,
      zeroline: false,
    },
    xaxis: {
      title: xAxisTitle,
      zeroline: false,
    },
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

ScatterChart.defaultProps = {
  xAxisTitle: '',
  customDataKeys: [],
};

ScatterChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
  colorKey: PropTypes.string.isRequired,
  colorMap: PropTypes.objectOf(PropTypes.string).isRequired,
  hovertemplate: PropTypes.string.isRequired,
  xAxisTitle: PropTypes.string,
  yAxisTitle: PropTypes.string.isRequired,
  markerSizeKey: PropTypes.string.isRequired,
  customDataKeys: PropTypes.arrayOf(PropTypes.string),
};

export default ScatterChart;
