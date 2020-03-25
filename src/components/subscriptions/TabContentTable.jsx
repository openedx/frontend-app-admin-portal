import React, { useCallback, useContext, useMemo } from 'react';
import { Pagination, Table } from '@edx/paragon';

import LicenseStatus from './LicenseStatus';
import LicenseActions from './LicenseActions';
import { SubscriptionContext } from './SubscriptionData';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_DEACTIVATED_USERS,
} from './constants';

const columns = [
  {
    label: 'Email address',
    key: 'emailAddress',
  },
  {
    label: 'Status',
    key: 'status',
  },
  {
    label: 'Actions',
    key: 'actions',
  },
];

export default function TabContentTable() {
  const { users, activeTab } = useContext(SubscriptionContext);

  const getUsersForActiveTab = useCallback(
    () => {
      switch (activeTab) {
        case TAB_ALL_USERS:
          return users.all;
        case TAB_PENDING_USERS:
          return users.pending;
        case TAB_LICENSED_USERS:
          return users.licensed;
        case TAB_DEACTIVATED_USERS:
          return users.deactivated;
        default:
          return [];
      }
    },
    [activeTab, users],
  );

  const tableData = useMemo(
    () => getUsersForActiveTab().map(user => ({
      emailAddress: user.emailAddress,
      status: <LicenseStatus user={user} />,
      actions: <LicenseActions user={user} />,
    })),
    [activeTab, users],
  );

  return (
    <React.Fragment>
      <div className="table-responsive">
        <Table
          data={tableData}
          columns={columns}
          className="table-striped"
        />
      </div>
      <div className="mt-3 d-flex justify-content-center">
        <Pagination
          onPageSelect={page => console.log(page)}
          pageCount={Math.ceil(getUsersForActiveTab().length / 10)}
          currentPage={1}
          paginationLabel="all users pagination"
        />
      </div>
    </React.Fragment>
  );
}
