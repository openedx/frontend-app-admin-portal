import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

/**
 * Treemap component renders a treemap using Plotly.js.
 *
 * @param {Object} labels - An array of labels for the treemap nodes.
 * @param {Object} values - An array of values for the treemap nodes.
 * @param {Object} parents - An array of parent labels for the treemap nodes.
 *
 * @returns The rendered Plotly treemap.
 */

const Treemap = ({
  labels, values, parents, onClick,
}) => {
  const treemapData = [{
    type: 'treemap',
    labels,
    parents,
    values,
    tiling: {
      pad: 0.2,
    },
    root: { color: 'white' },
    textinfo: 'label+value',
  }];

  const config = {
    displayModeBar: false,
  };

  const layout = {
    margin: {
      t: 0, l: 0, r: 0, b: 0,
    },
  };

  return (
    <Plot
      data={treemapData}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
      onClick={onClick}
    />
  );
};

Treemap.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ).isRequired,
  parents: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClick: PropTypes.func,
};

export default Treemap;
