import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Collapsible } from '@openedx/paragon';

import GroupDetailCard from './GroupDetailCard';

const GroupCardGrid = ({ groups }) => {
  const [previewGroups, setPreviewGroups] = useState();
  const [overflowGroups, setOverflowGroups] = useState();
  useEffect(() => {
    if (groups.length > 3) {
      setPreviewGroups(groups.slice(0, 3));
      setOverflowGroups(groups.slice(3));
    } else {
      setPreviewGroups(groups);
    }
  }, [groups]);
  return (
    <>
      <CardGrid
        columnSizes={{
          xs: 6,
          lg: 6,
          xl: 4,
        }}
        hasEqualColumnHeights="true"
      >
        {previewGroups?.map((group) => (
          <GroupDetailCard group={group} />
        ))}
      </CardGrid>
      {overflowGroups && (
        <Collapsible
          styling="basic"
          title={`Show all ${groups.length} groups`}
        >
          <CardGrid
            columnSizes={{
              xs: 6,
              lg: 6,
              xl: 4,
            }}
            hasEqualColumnHeights="true"
          >
            {overflowGroups.map((group) => (
              <GroupDetailCard group={group} />
            ))}
          </CardGrid>
        </Collapsible>
      )}
    </>
  );
};

GroupCardGrid.propTypes = {
  groups: PropTypes.shape.isRequired,
};

export default GroupCardGrid;
