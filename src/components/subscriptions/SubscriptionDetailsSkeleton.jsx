import React from 'react';
import { Skeleton } from '@edx/paragon';

const tableRowHeight = 50;
const tableRowCount = 10;

function SubscriptionDetailsSkeleton(props) {
  return (
    <div {...props}>
      <div className="sr-only">Loading...</div>
      <Skeleton height={175} />
      <Skeleton height={175} />
      <div className="d-md-flex">
        <div className="w-100 w-md-25">
          <Skeleton height={tableRowCount * tableRowHeight + 45} />
        </div>
        <div className="w-100 w-md-75">
          <Skeleton height={tableRowHeight} count={tableRowCount} />
        </div>
      </div>
    </div>
  );
}

export default SubscriptionDetailsSkeleton;
