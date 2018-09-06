import React from 'react';
import PropTypes from 'prop-types';

import './H3.scss';

const H3 = props => (
  <h3 className={props.className}>
    {props.children}
  </h3>
);

H3.defaultProps = {
  className: null,
};

H3.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default H3;
