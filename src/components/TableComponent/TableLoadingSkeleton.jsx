import React from 'react';
import Skeleton from 'react-loading-skeleton';

const TableLoadingSkeleton = () => (
  <>
    <div className="sr-only">Loading...</div>
    <Skeleton height={25} count={25} />
  </>
);

export default TableLoadingSkeleton;
