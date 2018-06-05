import React from 'react';
import PropTypes from 'prop-types';

import './H1.scss';

const H1 = props => (
  <h1>{props.children}</h1>
);


H1.propTypes = {
  children: PropTypes.node.isRequired,
};

export default H1;
