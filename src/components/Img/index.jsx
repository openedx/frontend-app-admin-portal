import React from 'react';
import PropTypes from 'prop-types';

import './Img.scss';

function Img(props) {
  return (
    <img src={props.src} alt={props.alt} {...props} />
  );
}

Img.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  alt: PropTypes.string.isRequired,
};

export default Img;
