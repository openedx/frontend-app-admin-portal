import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { generateAboutPageUrl } from '../data/utils';
import { CONTENT_HIGHLIGHTS_BASE_DATA, TRACK_EVENT_NAMES } from '../data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';

const ContentSearchResultCard = ({ enterpriseId, enterpriseSlug, original }) => {
  const {
    enterpriseCuration: {
      enterpriseCuration,
    },
  } = useContext(EnterpriseAppContext);
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
      ...CONTENT_HIGHLIGHTS_BASE_DATA(
        enterpriseId,
        enterpriseCuration.title,
        enterpriseCuration.uuid,
        e,
      ),
      content_metadata: {
        aggregationKey,
        contentKey: aggregationKey?.split(':')[1],
        contentType,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${TRACK_EVENT_NAMES.SELECT_CONTENT_ABOUT_PAGE}.clicked`,
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
