import React from 'react';
import { CardGrid } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import ContentHighlightSetCard from './ContentHighlightSetCard';
import { TEST_COURSE_HIGHLIGHTS_DATA } from './data/constants';

const ContentHighlightSetCardContainer = () => (
  <CardGrid
    columnSizes={{
      xs: 12,
      lg: 6,
      xl: 4,
    }}
  >
    {camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA).map(({ title, uuid, isPublished }) => (
      <ContentHighlightSetCard
        key={uuid}
        title={title}
        highlightSetUUID={uuid}
        isPublished={isPublished}
      />
    ))}
    {/* eslint-enable camelcase */}
  </CardGrid>
);
export default ContentHighlightSetCardContainer;
