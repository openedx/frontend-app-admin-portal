import React, { useContext, useMemo, useEffect } from 'react';
import { Pagination, Table } from '@edx/paragon';

import LicenseStatus from './LicenseStatus';
import LicenseActions from './LicenseActions';
import { SubscriptionContext } from './SubscriptionData';
import RemindUsersButton from './RemindUsersButton';
import { StatusContext } from './SubscriptionManagementPage';
import StatusAlert from '../StatusAlert';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_DEACTIVATED_USERS,
  PAGE_SIZE,
  SUBSCRIPTION_USERS,
} from './constants';
import LoadingMessage from '../LoadingMessage';

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
  const {
    activeTab,
    users,
    searchQuery,
    fetchSubscriptionUsers,
    fetchSubscriptionDetails,
    overview,
    requestStatus,
    errors,
  } = useContext(SubscriptionContext);
  const { setSuccessStatus } = useContext(StatusContext);
  const { isLoading } = requestStatus[SUBSCRIPTION_USERS] || { isLoading: false };
  const error = errors[SUBSCRIPTION_USERS];


  useEffect(() => {
    fetchSubscriptionUsers({ searchQuery });
  }, [activeTab]);

  const activeTabData = useMemo(
    () => {
      switch (activeTab) {
        case TAB_ALL_USERS:
          return {
            title: 'All Users',
            paginationLabel: 'pagination for all users',
            noResultsLabel: 'There are no users.',
          };
        case TAB_PENDING_USERS:
          return {
            title: 'Pending Users',
            paginationLabel: 'pagination for pending users',
            noResultsLabel: 'There are no pending users.',
          };
        case TAB_LICENSED_USERS:
          return {
            title: 'Licensed Users',
            paginationLabel: 'pagination for licensed users',
            noResultsLabel: 'There are no licensed users.',
          };
        case TAB_DEACTIVATED_USERS:
          return {
            title: 'Deactivated Users',
            paginationLabel: 'pagination for deactivated users',
            noResultsLabel: 'There are no deactivated users.',
          };
        default:
          return null;
      }
    },
    [activeTab],
  );

  const tableData = useMemo(
    () => users?.results?.map(user => ({
      emailAddress: user.user_email,
      status: <LicenseStatus user={user} />,
      actions: <LicenseActions user={user} />,
    })),
    [users],
  );

  return (
    <React.Fragment>
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="h4 mb-3">{activeTabData.title}</h3>
        {activeTab === TAB_PENDING_USERS && tableData?.length > 0 && (
          <RemindUsersButton
            pendingUsersCount={overview.assigned}
            isBulkRemind
            onSuccess={() => setSuccessStatus({
              visible: true,
              message: 'Successfully sent reminder(s)',
            })}
            fetchSubscriptionDetails={fetchSubscriptionDetails}
            fetchSubscriptionUsers={fetchSubscriptionUsers}
            searchQuery={searchQuery}
          />
        )}
      </div>
      {isLoading && <LoadingMessage className="loading mt-3" />}
      {
        error && <StatusAlert
          className="mt-3"
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title={`Unable to load data for ${error.key}`}
          message={`Try refreshing your screen (${error.message})`}
        />
      }
      { !isLoading && !error &&
        <React.Fragment>
          {tableData?.length > 0 ? (
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
                  // eslint-disable-next-line no-console
                  onPageSelect={page => console.log(page)}
                  pageCount={Math.ceil(users.count / PAGE_SIZE)}
                  currentPage={1}
                  paginationLabel={activeTabData.paginationLabel}
                />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <hr className="mt-0" />
              <StatusAlert
                alertType="warning"
                dialog={activeTabData.noResultsLabel}
                dismissible={false}
                open
              />
            </React.Fragment>
          )}
        </React.Fragment>
      }
    </React.Fragment>
  );
}
