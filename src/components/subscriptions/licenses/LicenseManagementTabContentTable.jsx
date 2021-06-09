import React, { useContext, useEffect, useMemo } from 'react';
import {
  Alert,
  Icon,
  Pagination,
  Table,
  MailtoLink,
  useToggle,
} from '@edx/paragon';
import { Error, WarningFilled } from '@edx/paragon/icons';

import LoadingMessage from '../../LoadingMessage';
import { ToastsContext } from '../../Toasts';
import RemindUsersButton from '../buttons/RemindUsersButton';
import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_REVOKED_USERS,
} from '../data/constants';
import LicenseActions from './LicenseActions';
import LicenseStatus from './LicenseStatus';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { useSubscriptionUsers } from '../data/hooks';
import { SubscriptionContext } from '../SubscriptionData';
import SubscriptionZeroStateMessage from '../SubscriptionZeroStateMessage';

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

const LicenseManagementTabContentTable = () => {
  const { errors, forceRefresh, setErrors } = useContext(SubscriptionContext);
  const {
    activeTab,
    currentPage,
    overview,
    searchQuery,
    setCurrentPage,
    subscription,
  } = useContext(SubscriptionDetailContext);
  const { addToast } = useContext(ToastsContext);

  const users = useSubscriptionUsers({
    activeTab,
    currentPage,
    searchQuery,
    subscriptionUUID: subscription.uuid,
    errors,
    setErrors,
  });

  const hasErrors = Object.values(errors).length > 0;
  const hasLoadedUsers = !!(users?.numPages || users?.count);

  const isRevocationCapEnabled = subscription?.isRevocationCapEnabled;
  const hasNoRevocationsRemaining = !!(isRevocationCapEnabled && subscription?.revocations?.remaining <= 0);

  const [isRevocationLimitAlertOpen, openRevocationLimitAlert, closeRevocationLimitAlert] = useToggle(false);
  useEffect(() => {
    if (hasNoRevocationsRemaining && !isRevocationLimitAlertOpen) {
      openRevocationLimitAlert();
    }
  }, [hasNoRevocationsRemaining]);

  const activeTabData = useMemo(() => {
    switch (activeTab) {
      case TAB_ALL_USERS:
        return {
          title: 'All Users',
          paginationLabel: 'pagination for all users',
          noResultsLabel: 'There are no Pending, Activated or Revoked users',
        };
      case TAB_PENDING_USERS:
        return {
          title: 'Pending Users',
          paginationLabel: 'pagination for pending users',
          noResultsLabel: 'There are no pending users',
        };
      case TAB_LICENSED_USERS:
        return {
          title: 'Licensed Users',
          paginationLabel: 'pagination for licensed users',
          noResultsLabel: 'There are no licensed users',
        };
      case TAB_REVOKED_USERS:
        return {
          title: 'Revoked Users',
          paginationLabel: 'pagination for revoked users',
          noResultsLabel: 'There are no revoked users',
        };
      default:
        return null;
    }
  }, [activeTab]);

  const tableData = useMemo(
    () => users?.results?.map(user => ({
      emailAddress: <span data-hj-suppress>{user.userEmail}</span>,
      status: (
        <LicenseStatus user={user} />
      ),
      actions: (
        <LicenseActions user={user} />
      ),
    })),
    [users],
  );

  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="mb-3">{activeTabData.title}</h3>
        {activeTab === TAB_PENDING_USERS && tableData?.length > 0 && (
          <RemindUsersButton
            pendingUsersCount={overview.assigned}
            isBulkRemind
            onSuccess={() => {
              addToast('Reminders successfully sent');
              forceRefresh();
            }}
            subscriptionUUID={subscription.uuid}
          />
        )}
      </div>
      {!hasLoadedUsers && (
        <LoadingMessage className="loading mt-3 subscriptions" />
      )}
      {hasErrors && Object.entries(errors).map(([title, message]) => (
        <Alert
          key={title}
          className="mt-3"
          variant="danger"
        >
          <Icon src={Error} className="alert-icon" />
          <Alert.Heading>Unable to load data for {title}</Alert.Heading>
          <p>Try refreshing your screen ({message})</p>
        </Alert>
      ))}
      {!hasErrors && hasLoadedUsers && (
        <>
          {activeTab === TAB_ALL_USERS && tableData?.length === 0 && !searchQuery ? (
            <SubscriptionZeroStateMessage />
          ) : (
            <>
              {tableData?.length > 0 ? (
                <>
                  <Alert
                    variant="warning"
                    show={isRevocationLimitAlertOpen}
                    onClose={closeRevocationLimitAlert}
                    dismissible
                  >
                    You have reached your revoke access limit. For help
                    managing your subscription licenses,
                    {' '}
                    <MailtoLink to="customersuccess@edx.org" className="alert-link">
                      contact Customer Support
                    </MailtoLink>.
                  </Alert>
                  <div className="table-responsive">
                    <Table
                      data={tableData}
                      columns={columns}
                      className="table-striped"
                    />
                  </div>
                  <div className="mt-3 d-flex justify-content-center">
                    <Pagination
                      onPageSelect={page => setCurrentPage(page)}
                      pageCount={users.numPages || 1}
                      currentPage={currentPage}
                      paginationLabel={activeTabData.paginationLabel}
                    />
                  </div>
                </>
              ) : (
                <>
                  <hr className="mt-0" />
                  <Alert variant="warning">
                    <Icon src={WarningFilled} className="alert-icon" />
                    <Alert.Heading>No results found</Alert.Heading>
                    <p>{activeTabData.noResultsLabel}</p>
                  </Alert>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default LicenseManagementTabContentTable;
