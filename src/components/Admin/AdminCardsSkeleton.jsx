import React from 'react';
import Skeleton from 'react-loading-skeleton';

const AdminCardsSkeleton = () => (
  <div
    className="admin-cards-skeleton mb-3 d-md-flex w-100"
  >
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </div>
);

export default AdminCardsSkeleton;
