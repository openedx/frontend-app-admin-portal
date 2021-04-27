import React from 'react';
import Skeleton from 'react-loading-skeleton';

const EnterpriseAppSkeleton = () => (
  <>
    <div className="sr-only">Loading...</div>
    <Skeleton height="8rem" />
    <Skeleton height="70vh" />
  </>
);

export default EnterpriseAppSkeleton;
