import React from 'react';
import PropTypes from 'prop-types';

import ContentHighlightCardItem from '../ContentHighlightCardItem';

const ContentSearchResultCard = ({ original }) => {
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
  } = original;

  return (
    <ContentHighlightCardItem
      title={title}
      contentType={contentType}
      partners={partners}
      cardImageUrl={cardImageUrl || originalImageUrl}
    />
  );
};

ContentSearchResultCard.propTypes = {
  original: PropTypes.shape({
    title: PropTypes.string,
    contentType: PropTypes.string,
    partners: PropTypes.arrayOf(PropTypes.shape()),
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
  }).isRequired,
};

export default ContentSearchResultCard;
