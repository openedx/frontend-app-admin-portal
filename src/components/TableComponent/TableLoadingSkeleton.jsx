import React from 'react';
import { Skeleton } from '@edx/paragon';

function TableLoadingSkeleton(props) {
  return (
    <div {...props}>
      <div className="sr-only">Loading...</div>
      <Skeleton height={25} count={25} />
    </div>
  );
}

export default TableLoadingSkeleton;
