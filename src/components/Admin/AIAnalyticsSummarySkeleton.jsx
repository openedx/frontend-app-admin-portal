import React from 'react';
import { Skeleton, Stack } from '@edx/paragon';

const AIAnalyticsSummarySkeleton = () => (
  <Stack direction="horizontal" gap={2}>
    <Skeleton height={40} width={250} />
    <Skeleton height={40} width={250} />
  </Stack>
);

export default AIAnalyticsSummarySkeleton;
