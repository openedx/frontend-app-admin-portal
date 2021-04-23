import React from 'react';
import Skeleton from 'react-loading-skeleton';

const tableRowHeight = 50;
const tableRowCount = 10;

const SubscriptionDetailsSkeleton = (props) => (
  <div {...props}>
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

export default SubscriptionDetailsSkeleton;
