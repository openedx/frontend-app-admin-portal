import React from 'react';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardImage = ({ imageContainerClassName, imageClassName, cardImage }) => (
  <div className={imageContainerClassName}>
    <Card.ImageCap
      className={imageClassName}
      src={cardImage}
      srcAlt=""
    />
  </div>
);

ZeroStateCardImage.propTypes = {
  imageContainerClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  cardImage: PropTypes.string.isRequired,
};
ZeroStateCardImage.defaultProps = {
  imageContainerClassName: 'p-4',
  imageClassName: undefined,
};

export default ZeroStateCardImage;
