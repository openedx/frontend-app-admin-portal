import React, { useState } from 'react';
import { CardGrid } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightsCardItemsContainer = () => {
  const { highlightUUID } = useParams();
  const [highlightCourses] = useState(
    TEST_COURSE_HIGHLIHTS_DATA.filter(highlight => highlight.uuid === highlightUUID)[0].courses,
  );

  return (
    <>
      {highlightCourses && (
      <CardGrid
        columnSizes={{
          xs: 12,
          lg: 6,
          xl: 4,
        }}
      >
        {highlightCourses.map(({ title, type }, index) => (
          <ContentHighlightCardItem
            key={`${title}${index + 1}`}
            title={title}
            type={type}
          />
        ))}
      </CardGrid>
      )}
    </>
  );
};

export default ContentHighlightsCardItemsContainer;
