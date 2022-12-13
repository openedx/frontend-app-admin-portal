import React from 'react';
import { CardGrid } from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import { generateAboutPageUrl } from './data/constants';

const ContentHighlightsCardItemsContainer = ({ enterpriseSlug, isLoading, highlightedContent }) => {
  if (!highlightedContent || highlightedContent?.length === 0) {
    return <div data-testid="empty-highlighted-content" />;
  }
  return (
    <CardGrid
      columnSizes={{
        xs: 12,
        lg: 6,
        xl: 4,
      }}
    >
      {highlightedContent.map(({
        uuid, title, contentType, authoringOrganizations, contentKey,
      }) => (

        <ContentHighlightCardItem
          isLoading={isLoading}
          key={uuid}
          cardImageUrl="https://picsum.photos/200/300"
          title={title}
          hyperlink={generateAboutPageUrl(enterpriseSlug, contentType.toLowerCase(), contentKey)}
          contentType={contentType.toLowerCase()}
          partners={authoringOrganizations}
        />
      ))}
      {isLoading && <div data-testid="card-item-skeleton" />}
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
