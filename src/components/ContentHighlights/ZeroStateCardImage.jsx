import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';
import logo from '@edx/brand/logo.svg';

const ZeroStateCardImage = ({ imageContainerClassNames, imageClassNames, cardImage }) => (
  <div className={imageContainerClassNames} style={{ textAlign: '-webkit-center' }}>
    <Card.ImageCap
      className={imageClassNames}
      src={cardImage}
      srcAlt="Card image of unimaginable progress"
    />
  </div>
);

ZeroStateCardImage.propTypes = {
  imageContainerClassNames: PropTypes.string,
  imageClassNames: PropTypes.string,
  cardImage: PropTypes.string,
};
ZeroStateCardImage.defaultProps = {
  imageContainerClassNames: 'p-4',
  imageClassNames: 'w-33',
  cardImage: logo,
};

export default ZeroStateCardImage;
