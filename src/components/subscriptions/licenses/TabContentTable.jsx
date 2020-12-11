import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Pagination, Table } from '@edx/paragon';

import LoadingMessage from '../../LoadingMessage';
import StatusAlert from '../../StatusAlert';
import { ToastsContext } from '../../Toasts';
import RemindUsersButton from '../buttons/RemindUsersButton';
import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_REVOKED_USERS,
} from '../data/constants';
import AddUsersButton from '../buttons/AddUsersButton';
import LicenseActions from './LicenseActions';
import LicenseStatus from './LicenseStatus';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { useSubscriptionUsers } from '../data/hooks';
import { SubscriptionContext } from '../SubscriptionData';

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

const TabContentTable = ({ enterpriseSlug }) => {
  const { errors, forceRefresh, setErrors } = useContext(SubscriptionContext);
  const {
    activeTab,
    setActiveTab,
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
  const hasLoadedUsers = !!(users?.numPages);
  const hasNoRevocationsRemaining = subscription?.revocations.remaining <= 0;

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

  const tableData = useMemo(() => users?.results?.map(user => ({
    emailAddress: user.userEmail,
    status: (
      <LicenseStatus
        user={{ ...user, lastRemindDate: user.lastRemindDate }}
      />
    ),
    actions: (
      <LicenseActions user={user} />
    ),
  })), [users]);

  const SubscriptionZeroStateMessaging = () => (
    <Card className="text-center">
      <Card.Body>
        <h2>Get Started</h2>
        <p className="py-2 lead">
          Assign your learners to a subscription license to enable their learning experiences on edX.
        </p>
        <AddUsersButton
          onSuccess={({ numSuccessfulAssignments }) => {
            forceRefresh();
            addToast(`${numSuccessfulAssignments} email addresses were successfully added.`);
            setActiveTab(TAB_PENDING_USERS);
          }}
        />
      </Card.Body>
    </Card>
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
        <StatusAlert
          className="mt-3"
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title={`Unable to load data for ${title}`}
          message={`Try refreshing your screen (${message})`}
          key={title}
        />
      ))}
      {!hasErrors && hasLoadedUsers && (
        <>
          {activeTab === TAB_ALL_USERS && tableData?.length === 0 && !searchQuery ? (
            <SubscriptionZeroStateMessaging />
          ) : (
            <>
              {tableData?.length > 0 ? (
                <>
                  {hasNoRevocationsRemaining && (
                    <StatusAlert
                      alertType="warning"
                      message={(
                        <>
                          You have reached your revoke access limit. For help
                          managing your subscription licenses,
                          {' '}
                          <Link to={`/${enterpriseSlug}/admin/support`} className="alert-link">
                            contact Customer Support
                          </Link>.
                        </>
                      )}
                    />
                  )}
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
                      pageCount={users.numPages}
                      currentPage={currentPage}
                      paginationLabel={activeTabData.paginationLabel}
                    />
                  </div>
                </>
              ) : (
                <>
                  <hr className="mt-0" />
                  <StatusAlert
                    alertType="warning"
                    title="No results found"
                    message={activeTabData.noResultsLabel}
                    dismissible={false}
                    open
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

TabContentTable.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(TabContentTable);
