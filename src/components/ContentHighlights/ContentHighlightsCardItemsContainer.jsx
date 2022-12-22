import React from 'react';
import { CardGrid, Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import {
  DEFAULT_ERROR_MESSAGE,
  HIGHLIGHTS_CARD_GRID_COLUMN_SIZES,
  MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
} from './data/constants';
import SkeletonContentCardContainer from './SkeletonContentCardContainer';
import { generateAboutPageUrl } from './data/utils';
import EVENT_NAMES from '../../eventTracking';

const ContentHighlightsCardItemsContainer = ({
  enterpriseId, enterpriseSlug, isLoading, highlightedContent,
}) => {
  if (isLoading) {
    return (
      <SkeletonContentCardContainer itemCount={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET} />
    );
  }
  if (!highlightedContent || highlightedContent?.length === 0) {
    return (
      <Alert data-testid="empty-highlighted-content" variant="warning">
        {DEFAULT_ERROR_MESSAGE.EMPTY_HIGHLIGHT_SET}
      </Alert>
    );
  }
  const trackEvent = (metaData = {}) => {
    const trackInfo = {
      content_metadata: {
        aggregation_key: `${metaData?.contentType}:${metaData?.contentKey}`,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.HIGHLIGHT_DASHBOARD_SET_ABOUT_PAGE}.clicked`,
      trackInfo,
    );
  };
  return (
    <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
      {highlightedContent.map(({
        uuid, title, contentType, authoringOrganizations, contentKey, cardImageUrl,
      }) => (
        <ContentHighlightCardItem
          isLoading={isLoading}
          key={uuid}
          cardImageUrl={cardImageUrl}
          title={title}
          href={
            {
              destination: generateAboutPageUrl({
                enterpriseSlug,
                contentType: contentType?.toLowerCase(),
                contentKey,
              }),
              target: '_blank',
              onClick: () => trackEvent({ contentType, contentKey }),
            }
        }
          contentType={contentType?.toLowerCase()}
          partners={authoringOrganizations}
        />
      ))}
    </CardGrid>
  );
};

ContentHighlightsCardItemsContainer.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  highlightedContent: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
    title: PropTypes.string,
    cardImageUrl: PropTypes.string,
    authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      logoImageUrl: PropTypes.string,
      uuid: PropTypes.string,
    })),
  })).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightsCardItemsContainer);
