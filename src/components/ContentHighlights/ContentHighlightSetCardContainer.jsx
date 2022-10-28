import React from 'react';
import { CardGrid } from '@edx/paragon';
import ContentHighlightSetCard from './ContentHighlightSetCard';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightSetCardContainer = () => (
  <>
    <CardGrid
      columnSizes={{
        xs: 12,
        lg: 6,
        xl: 4,
      }}
    >
      {/* eslint-disable camelcase */}
      {TEST_COURSE_HIGHLIHTS_DATA.map(({ title, uuid, is_published }) => (
        <ContentHighlightSetCard
          key={uuid}
          title={title}
          highlightUUID={uuid}
          isPublished={is_published}
        />
      ))}
      {/* eslint-enable camelcase */}
    </CardGrid>
  </>
);
export default ContentHighlightSetCardContainer;
