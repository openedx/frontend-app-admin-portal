import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { generateAboutPageUrl } from '../data/utils';

const ContentSearchResultCard = ({ enterpriseSlug, original }) => {
  const {
    aggregationKey,
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    firstEnrollablePaidSeatPrice,
  } = original;
  return (
    <ContentHighlightCardItem
      title={title}
      href={generateAboutPageUrl({
        enterpriseSlug,
        contentType: contentType?.toLowerCase(),
        contentKey: aggregationKey?.split(':')[1],
      })}
      contentType={contentType}
      partners={partners}
      cardImageUrl={cardImageUrl || originalImageUrl}
      price={firstEnrollablePaidSeatPrice}
    />
  );
};

ContentSearchResultCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  original: PropTypes.shape({
    aggregationKey: PropTypes.string,
    title: PropTypes.string,
    contentType: PropTypes.string,
    partners: PropTypes.arrayOf(PropTypes.shape()),
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
    firstEnrollablePaidSeatPrice: PropTypes.number,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentSearchResultCard);
