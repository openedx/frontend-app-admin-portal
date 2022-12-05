import React from 'react';
import PropTypes from 'prop-types';

import ContentHighlightCardItem from '../ContentHighlightCardItem';

const ContentConfirmContentCard = ({ original }) => {
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    extras,
  } = original;
  return (
    <ContentHighlightCardItem
      title={title}
      contentType={contentType}
      partners={partners}
      cardImageUrl={cardImageUrl || originalImageUrl}
      extras={extras}
    />
  );
};

ContentConfirmContentCard.propTypes = {
  original: PropTypes.shape({
    title: PropTypes.string,
    contentType: PropTypes.string,
    partners: PropTypes.arrayOf(PropTypes.shape()),
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
    extras: PropTypes.shape({
      firstEnrollablePaidSeatPrice: PropTypes.number,
    }),
  }).isRequired,
};

export default ContentConfirmContentCard;
