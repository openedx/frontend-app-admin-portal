import React from 'react';
import { Skeleton } from '@openedx/paragon';

const TableLoadingSkeleton = (props) => (
  <div {...props}>
    <div className="sr-only">Loading...</div>
    <Skeleton height={25} count={25} />
  </div>
);

export default TableLoadingSkeleton;
