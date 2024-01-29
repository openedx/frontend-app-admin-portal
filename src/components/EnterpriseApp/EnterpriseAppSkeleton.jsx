import React from 'react';
import { Skeleton } from '@edx/paragon';

const EnterpriseAppSkeleton = () => (
  <>
    <div className="sr-only" data-testid="enterprise-app-skeleton">Loading...</div>
    <Skeleton height="8rem" />
    <Skeleton height="70vh" />
  </>
);

export default EnterpriseAppSkeleton;
