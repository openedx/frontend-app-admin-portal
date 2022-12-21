import React from 'react';
import PropTypes from 'prop-types';
import { Delete } from '@edx/paragon/icons';
import { IconButton, Icon } from '@edx/paragon';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { useContentHighlightsContext } from '../data/hooks';
import { generateAboutPageUrl } from '../data/utils';
import { TRACK_EVENT_NAMES } from '../data/constants';

const ContentConfirmContentCard = ({ enterpriseId, enterpriseSlug, original }) => {
  const { deleteSelectedRowId } = useContentHighlightsContext();
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    firstEnrollablePaidSeatPrice,
    aggregationKey,
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
      `${TRACK_EVENT_NAMES.STEPPER_CONFIRM_CONTENT_ABOUT_PAGE}.clicked`,
      trackInfo,
    );
  };
  return (
    <div className="d-flex w-100" data-testid="title-test">
      <ContentHighlightCardItem
        title={title}
        href={
          {
            destination: generateAboutPageUrl({
              enterpriseSlug,
              contentType: contentType?.toLowerCase(),
              contentKey: aggregationKey?.split(':')[1],
            }),
            target: '_blank',
            onClick: trackEvent,
          }
}
        contentType={contentType}
        partners={partners}
        cardImageUrl={cardImageUrl || originalImageUrl}
        price={firstEnrollablePaidSeatPrice}

      />
      <IconButton
        src={Delete}
        iconAs={Icon}
        alt={`Remove ${title} from highlight collection`}
        onClick={() => deleteSelectedRowId(aggregationKey)}
        className="ml-1 flex-shrink-0"
      />
    </div>
  );
};

ContentConfirmContentCard.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  original: PropTypes.shape({
    title: PropTypes.string,
    contentType: PropTypes.string,
    partners: PropTypes.arrayOf(PropTypes.shape()),
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
    firstEnrollablePaidSeatPrice: PropTypes.number,
    aggregationKey: PropTypes.string,
  }).isRequired,
};

export const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentConfirmContentCard);
