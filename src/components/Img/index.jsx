import React from 'react';
import PropTypes from 'prop-types';

import './Img.scss';

const Img = (props) => (
  <img src={props.src} alt={props.alt} data-testid={props.dataTestId} {...props} />
);

Img.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  dataTestId: PropTypes.string,
  alt: PropTypes.string.isRequired,
};

export default Img;
