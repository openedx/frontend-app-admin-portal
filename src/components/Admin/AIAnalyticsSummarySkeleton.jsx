import React from 'react';
import { Skeleton, Stack } from '@openedx/paragon';

const AIAnalyticsSummarySkeleton = () => (
  <Stack direction="horizontal" gap={2}>
    <Skeleton height={40} width={250} />
    {/* Placeholder for Track Progress is currently hidden due to data inconsistency, will be addressed in ENT-7812 */}
    <Skeleton className="d-none" height={40} width={250} />
  </Stack>
);

export default AIAnalyticsSummarySkeleton;
