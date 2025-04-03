import React from 'react';
import { Skeleton } from '@openedx/paragon';

const AdminCardsSkeleton = () => (
  <div
    className="admin-cards-skeleton mb-3 d-md-flex w-100"
  >
    <div className="sr-only">Loading...</div>
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </div>
);

export default AdminCardsSkeleton;
