import React from 'react';
import PropTypes from 'prop-types';

import './H1.scss';

const H1 = props => (
  <h1 className={props.className}>
    {props.children}
  </h1>
);

H1.defaultProps = {
  className: null,
};

H1.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default H1;
