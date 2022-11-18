import React, { useState } from 'react';
import { CardGrid } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import { TEST_COURSE_HIGHLIGHTS_DATA } from './data/constants';

function ContentHighlightsCardItemsContainer() {
  const [highlightCourses] = useState(
    camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA)[0]?.highlightedContent,
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
        uuid, title, contentType, authoringOrganizations,
      }) => (
        <ContentHighlightCardItem
          key={uuid}
          title={title}
          type={contentType.toLowerCase()}
          authoringOrganizations={authoringOrganizations}
        />
      ))}
    </CardGrid>
  );
}

export default ContentHighlightsCardItemsContainer;
