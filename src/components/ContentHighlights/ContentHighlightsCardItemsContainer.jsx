import React from 'react';
import { CardGrid, Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import {
  DEFAULT_ERROR_MESSAGE, HIGHLIGHTS_CARD_GRID_COLUMN_SIZES, MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
} from './data/constants';
import SkeletonContentCardContainer from './SkeletonContentCardContainer';
import { generateAboutPageUrl } from './data/utils';

const ContentHighlightsCardItemsContainer = ({ enterpriseSlug, isLoading, highlightedContent }) => {
  if (isLoading) {
    return (
      <SkeletonContentCardContainer length={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET} />
    );
  }
  if (!highlightedContent || highlightedContent?.length === 0) {
    return (
      <Alert data-testid="empty-highlighted-content" variant="warning">
        {DEFAULT_ERROR_MESSAGE.EMPTY_HIGHLIGHT_SET}
      </Alert>
    );
  }
  return (
    <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
      {highlightedContent.map(({
        uuid, title, contentType, authoringOrganizations, contentKey,
      }) => (
        <ContentHighlightCardItem
          isLoading={isLoading}
          key={uuid}
          cardImageUrl="https://picsum.photos/200/300"
          title={title}
          href={generateAboutPageUrl({
            enterpriseSlug,
            contentType: contentType?.toLowerCase(),
            contentKey,
          })}
          contentType={contentType?.toLowerCase()}
          partners={authoringOrganizations}
        />
      ))}
    </CardGrid>
  );
};

ContentHighlightsCardItemsContainer.propTypes = {
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
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightsCardItemsContainer);
