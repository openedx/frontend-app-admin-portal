import React from 'react';
import { CardGrid } from '@edx/paragon';
import PropTypes from 'prop-types';
import ContentHighlightCardItem from './ContentHighlightCardItem';

const ContentHighlightsCardItemsContainer = ({ isLoading, highlightedContent }) => {
  if (!highlightedContent || highlightedContent?.length === 0) {
    return null;
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
        uuid, title, contentType, authoringOrganizations,
      }) => (

        <ContentHighlightCardItem
          isLoading={isLoading}
          key={uuid}
          cardImageUrl="https://picsum.photos/200/300"
          title={title}
          contentType={contentType.toLowerCase()}
          partners={authoringOrganizations}
        />
      ))}
    </CardGrid>
  );
};

ContentHighlightsCardItemsContainer.propTypes = {
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

export default ContentHighlightsCardItemsContainer;
