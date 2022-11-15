import React, { useState } from 'react';
import { CardGrid } from '@edx/paragon';
import Proptypes from 'prop-types';
import ContentHighlightCardItem from '../ContentHighlightCardItem';

const HighlightStepperCardItemsContainer = ({ content }) => {
  const [highlightCourses] = useState(content);
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
};

HighlightStepperCardItemsContainer.propTypes = {
  content: Proptypes.arrayOf(Proptypes.shape({
    uuid: Proptypes.string,
    title: Proptypes.string,
    contentType: Proptypes.string,
    authoringOrganizations: Proptypes.arrayOf(Proptypes.shape({
      name: Proptypes.string,
      uuid: Proptypes.string,
      logoImageUrl: Proptypes.string,
    })),
  })).isRequired,
};

export default HighlightStepperCardItemsContainer;
