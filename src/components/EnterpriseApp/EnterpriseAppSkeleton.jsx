import React from 'react';
import { Skeleton } from '@edx/paragon';

const EnterpriseAppSkeleton = () => (
  <>
    <div className="sr-only">Loading...</div>
    <Skeleton height="8rem" />
    <Skeleton height="70vh" />
  </>
);

export default EnterpriseAppSkeleton;
