import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '@edx/paragon';

import ContentHighlightSetCard from './ContentHighlightSetCard';
import { HIGHLIGHTS_CARD_GRID_COLUMN_SIZES } from './data/constants';

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
      <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
        {highlightSets.map(({
          title,
          uuid,
          isPublished,
          highlightedContentUuids,
          cardImageUrl,
        }) => (
          <ContentHighlightSetCard
            key={uuid}
            title={title}
            highlightSetUUID={uuid}
            isPublished={isPublished}
            itemCount={highlightedContentUuids.length}
            imageCapSrc={cardImageUrl}
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
