import React from 'react';
import { Skeleton } from '@edx/paragon';

function EnterpriseAppSkeleton() {
  return (
    <>
      <div className="sr-only">Loading...</div>
      <Skeleton height="8rem" />
      <Skeleton height="70vh" />
    </>
  );
}

export default EnterpriseAppSkeleton;
