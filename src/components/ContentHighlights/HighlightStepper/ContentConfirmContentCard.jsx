import React from 'react';
import PropTypes from 'prop-types';
import { Delete } from '@edx/paragon/icons';
import { IconButton, Icon } from '@edx/paragon';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { useContentHighlightsContext } from '../data/hooks';
import { generateAboutPageUrl } from '../data/utils';
import EVENT_NAMES from '../../../eventTracking';

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
  const trackClickEvent = () => {
    const trackInfo = {
      aggregation_key: aggregationKey,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_CONFIRM_CONTENT_ABOUT_PAGE}`,
      trackInfo,
    );
  };
  const trackDeleteEvent = (e) => {
    e.persist();
    const trackInfo = {
      aggregation_key: aggregationKey,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_STEP_CONFIRM_CONTENT_DELETE}`,
      trackInfo,
    );
    deleteSelectedRowId(aggregationKey);
  };
  return (
    <div className="d-flex w-100" data-testid="title-test">
      <ContentHighlightCardItem
        title={title}
        hyperlinkAttrs={
          {
            href: generateAboutPageUrl({
              enterpriseSlug,
              contentType: contentType.toLowerCase(),
              contentKey: aggregationKey.split(':')[1],
            }),
            target: '_blank',
            onClick: trackClickEvent,
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
        onClick={trackDeleteEvent}
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
