import React from 'react';
import { CardGrid } from '@edx/paragon';
import ContentHighlightSetCard from './ContentHighlightSetCard';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

function ContentHighlightCardContainer() {
  return (
    <CardGrid
      columnSizes={{
        xs: 12,
        lg: 6,
        xl: 4,
      }}
    >
      {TEST_COURSE_HIGHLIHTS_DATA.map(({ title, uuid }) => (
        <ContentHighlightSetCard
          key={uuid}
          title={title}
          highlightUUID={uuid}
        />
      ))}
    </CardGrid>
  );
}
export default ContentHighlightCardContainer;
