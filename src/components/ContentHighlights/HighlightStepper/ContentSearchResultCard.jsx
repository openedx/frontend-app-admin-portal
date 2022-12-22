import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { generateAboutPageUrl } from '../data/utils';
import EVENT_NAMES from '../../../eventTracking';

const ContentSearchResultCard = ({ enterpriseId, enterpriseSlug, original }) => {
  const {
    aggregationKey,
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    firstEnrollablePaidSeatPrice,
  } = original;
  const trackEvent = (e) => {
    e.persist();
    const trackInfo = {
      content_metadata: {
        aggregation_key: aggregationKey,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_SELECT_CONTENT_ABOUT_PAGE}.clicked`,
      trackInfo,
    );
  };
  return (
    <ContentHighlightCardItem
      title={title}
      href={{
        destination: generateAboutPageUrl({
          enterpriseSlug,
          contentType: contentType?.toLowerCase(),
          contentKey: aggregationKey?.split(':')[1],
        }),
        target: '_blank',
        onClick: trackEvent,
      }}
      contentType={contentType}
      partners={partners}
      cardImageUrl={cardImageUrl || originalImageUrl}
      price={firstEnrollablePaidSeatPrice}
    />
  );
};

ContentSearchResultCard.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
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
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentSearchResultCard);
