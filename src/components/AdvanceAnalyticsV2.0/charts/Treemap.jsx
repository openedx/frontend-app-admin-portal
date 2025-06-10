import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

/**
 * Treemap component renders a bart chart using Plotly.js.
 *
 * @param {Object} data - The data to be plotted, with skill labels and their corresponding learning hour values.
 *
 * @returns The rendered Plotly treemap.
 */
const Treemap = ({
  data
}) => {
  const plotData = [{
    type: "treemap",
    labels: data.labels,
    values: data.values,
    parents: Array(data.labels.length).fill(''), // no parents in our case
    tiling: {
      pad: 0.2
    },

    // hoverinfo: 'none',
    // textinfo: "none",
    // level: "",
    // maxdepth: 1,
    texttemplate: "%{label}: %{value}",
    hovertemplate: "Skill: %{label}<br>Learning Hours: %{value}<extra></extra>",
    // textinfo: 'label+value',
    // hovertemplate: '%{label}<extra></extra>',
    root: { color: 'pink' },
    // hoverlabel: {
    //   bgcolor: 'lightgray',
    //   font: { color: 'black' },
    //   align: 'top',
    // },
    // hoverinfo: 'label+value parent',
  }]

  const config = {
    displayModeBar: false,
  };

  const layout = {
    autosize: true,
    margin: { t: 0, l: 0, r: 0, b: 0 },
    textposition: 'top right',
  }

  return (
    <Plot
      data={plotData}
      layout={layout}
      useResizeHandler={true}
      config={config}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

Treemap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      values: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
};

export default Treemap;
