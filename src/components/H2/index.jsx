import React from 'react';
import PropTypes from 'prop-types';

import './H2.scss';

const H2 = props => (
  <h2>
    {props.children}
  </h2>
);


H2.propTypes = {
  children: PropTypes.node.isRequired,
};

export default H2;
