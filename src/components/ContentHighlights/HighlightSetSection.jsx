import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '@edx/paragon';

import ContentHighlightSetCard from './ContentHighlightSetCard';

const HighlightSetSection = ({
  title: sectionTitle,
  highlightSets,
}) => {
  if (highlightSets.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3">{sectionTitle}</h3>
      <CardGrid
        columnSizes={{
          xs: 12,
          lg: 6,
          xl: 4,
        }}
      >
        {highlightSets.map(({
          title,
          uuid,
          isPublished,
          highlightedContentUuids,
        }) => (
          <ContentHighlightSetCard
            key={uuid}
            title={title}
            highlightUUID={uuid}
            isPublished={isPublished}
            itemCount={highlightedContentUuids.length}
            imageCapSrc="https://source.unsplash.com/360x200/?cat,dog"
          />
        ))}
      </CardGrid>
    </div>
  );
};

HighlightSetSection.propTypes = {
  title: PropTypes.string.isRequired,
  highlightSets: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    highlightedContentUuids: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};

export default HighlightSetSection;
