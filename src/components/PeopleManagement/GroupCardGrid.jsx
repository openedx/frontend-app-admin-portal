import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Collapsible, Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

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
        <Collapsible.Advanced>
          <Collapsible.Body>
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
          </Collapsible.Body>
          <Collapsible.Trigger className="d-flex justify-content-end text-info">
            <Collapsible.Visible whenClosed>
              Show all {groups.length} groups <Icon src={ExpandMore} />
            </Collapsible.Visible>
            <Collapsible.Visible whenOpen>
              Show less <Icon src={ExpandLess} />
            </Collapsible.Visible>
          </Collapsible.Trigger>
        </Collapsible.Advanced>
      )}
    </>
  );
};

GroupCardGrid.propTypes = {
  groups: PropTypes.shape.isRequired,
};

export default GroupCardGrid;
