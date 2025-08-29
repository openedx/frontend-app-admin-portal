import React from 'react';
import { Skeleton } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const AdminCardsSkeleton = () => (
  <div
    className="admin-cards-skeleton mb-3 d-md-flex w-100"
  >
    <div className="sr-only">
      <FormattedMessage
        id="admin.portal.admin.cards.skeleton.loading.label"
        defaultMessage="Loading..."
        description="Label for the loading state of the admin cards skeleton"
      />
    </div>
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </div>
);

export default AdminCardsSkeleton;
