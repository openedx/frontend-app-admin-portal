import React from 'react';
import { CardGrid } from '@edx/paragon';
import ContentHighlightCardSet from './ContentHighlightCardSet';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightCardContainer = () => (
  <CardGrid
    columnSizes={{
      xs: 12,
      lg: 6,
      xl: 4,
    }}
  >
    {TEST_COURSE_HIGHLIHTS_DATA.map(({ title, uuid }, index) => (
      <ContentHighlightCardSet
        key={`${title}${index + 1}`}
        title={title}
        index={index + 1}
        highlightUUID={uuid}
      />
    ))}
  </CardGrid>
);
export default ContentHighlightCardContainer;
