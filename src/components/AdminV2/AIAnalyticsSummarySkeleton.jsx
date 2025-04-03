import React from 'react';
import { Skeleton, Stack } from '@openedx/paragon';
import PropTypes from 'prop-types';

const AIAnalyticsSummarySkeleton = ({ renderOverviewHeading }) => (
  <Stack gap={2} direction="horizontal" className="justify-content-between">
    {renderOverviewHeading()}
    <Stack direction="horizontal" gap={2}>
      <Skeleton height={40} width={250} />
      {/* Placeholder for Track Progress is currently hidden due to data inconsistency,
          will be addressed in ENT-7812
      */}
      <Skeleton className="d-none" height={40} width={250} />
    </Stack>
  </Stack>
);

AIAnalyticsSummarySkeleton.propTypes = {
  renderOverviewHeading: PropTypes.func,
};

export default AIAnalyticsSummarySkeleton;
