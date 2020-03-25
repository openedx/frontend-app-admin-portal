import React, { useContext, useMemo } from 'react';
import { Pagination, StatusAlert, Table } from '@edx/paragon';

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

  const activeTabData = useMemo(
    () => {
      switch (activeTab) {
        case TAB_ALL_USERS:
          return {
            users: users.all,
            paginationLabel: 'pagination for all users',
            noResultsLabel: 'There are no users.',
          };
        case TAB_PENDING_USERS:
          return {
            users: users.pending,
            paginationLabel: 'pagination for pending users',
            noResultsLabel: 'There are no pending users.',
          };
        case TAB_LICENSED_USERS:
          return {
            users: users.licensed,
            paginationLabel: 'pagination for licensed users',
            noResultsLabel: 'There are no licensed users.',
          };
        case TAB_DEACTIVATED_USERS:
          return {
            users: users.deactivated,
            paginationLabel: 'pagination for deactivated users',
            noResultsLabel: 'There are no deactivated users.',
          };
        default:
          return null;
      }
    },
    [activeTab, users],
  );

  const tableData = useMemo(
    () => activeTabData.users.map(user => ({
      emailAddress: user.emailAddress,
      status: <LicenseStatus user={user} />,
      actions: <LicenseActions user={user} />,
    })),
    [activeTabData],
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
      {tableData.length > 0 ? (
        <div className="mt-3 d-flex justify-content-center">
          <Pagination
            // eslint-disable-next-line no-console
            onPageSelect={page => console.log(page)}
            pageCount={Math.ceil(activeTabData.users.length / 10)}
            currentPage={1}
            paginationLabel={activeTabData.paginationLabel}
          />
        </div>
      ) : (
        <StatusAlert
          alertType="warning"
          dialog={activeTabData.noResultsLabel}
          dismissible={false}
          open
        />
      )}
    </React.Fragment>
  );
}
