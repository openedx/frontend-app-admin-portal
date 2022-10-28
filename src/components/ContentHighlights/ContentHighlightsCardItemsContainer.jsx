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

  if (!highlightCourses) {
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
      {highlightCourses.map(({
        uuid, title, type, owners,
      }) => (
        <ContentHighlightCardItem
          key={uuid}
          title={title}
          type={type}
          authoringOrganizations={owners}
        />
      ))}
    </CardGrid>
  );
};

export default ContentHighlightsCardItemsContainer;
