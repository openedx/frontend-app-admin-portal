import React, {
  useCallback, useMemo, useContext, useState,
} from 'react';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Toast,
} from '@edx/paragon';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { SubscriptionContext } from '../../../subscriptions/SubscriptionData';
import { SubscriptionDetailContext } from '../../../subscriptions/SubscriptionDetailContextProvider';
import {
  DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED,
} from '../../../subscriptions/data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { formatTimestamp } from '../../../../utils';
import SubscriptionZeroStateMessage from '../../../subscriptions/SubscriptionZeroStateMessage';
import DownloadCsvButton from '../../../subscriptions/buttons/DownloadCsvButton';
import EnrollBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/EnrollBulkAction';
import RemindBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/RemindBulkAction';
import RevokeBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/RevokeBulkAction';
import LicenseManagementTableActionColumn from '../../../subscriptions/licenses/LicenseManagementTable/LicenseManagementTableActionColumn';
import LicenseManagementUserBadge from '../../../subscriptions/licenses/LicenseManagementTable/LicenseManagementUserBadge';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';
import { pushEvent, EVENTS } from '../../../../optimizely';

const userRecentAction = (user) => {
  switch (user.status) {
    case ACTIVATED: {
      return `Activated: ${formatTimestamp({ timestamp: user.activationDate })}`;
    }
    case REVOKED: {
      return `Revoked: ${formatTimestamp({ timestamp: user.revokedDate })}`;
    }
    case ASSIGNED: {
      return `Invited: ${formatTimestamp({ timestamp: user.lastRemindDate })}`;
    }
    default: {
      return null;
    }
  }
};

const defaultLPRStatusFilter = [ASSIGNED, ACTIVATED].join();

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const LicenseManagementTable = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const {
    forceRefresh: forceRefreshSubscription,
  } = useContext(SubscriptionContext);

  const {
    currentPage,
    overview,
    forceRefreshDetailView,
    setSearchQuery,
    setCurrentPage,
    subscription,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
  } = useContext(SubscriptionDetailContext);

  const isExpired = moment().isAfter(subscription.expirationDate);

  const sendStatusFilterEvent = useCallback((statusFilter) => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.FILTER_STATUS,
      { applied_filters: statusFilter },
    );
  }, [subscription.enterpriseCustomerUuid]);

  const sendEmailFilterEvent = useCallback(() => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.FILTER_EMAIL,
    );
  }, [subscription.enterpriseCustomerUuid]);

  const sendPaginationEvent = useCallback((oldPage, newPage) => {
    const eventName = newPage - oldPage > 0
      ? SUBSCRIPTION_TABLE_EVENTS.PAGINATION_NEXT
      : SUBSCRIPTION_TABLE_EVENTS.PAGINATION_PREVIOUS;

    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      eventName,
      { page: newPage },
    );
  }, [subscription.enterpriseCustomerUuid]);

  // Filtering and pagination
  const updateFilters = useCallback((filters) => {
    if (filters.length < 1) {
      setSearchQuery(null);
      setUserStatusFilter(defaultLPRStatusFilter);
    } else {
      filters.forEach((filter) => {
        switch (filter.id) {
          case 'statusBadge': {
            const newStatusFilter = filter.value.join();
            sendStatusFilterEvent(newStatusFilter);
            setUserStatusFilter(newStatusFilter);
            break;
          }
          case 'emailLabel': {
            sendEmailFilterEvent();
            setSearchQuery(filter.value);
            break;
          }
          default: break;
        }
      });
    }
  }, [sendEmailFilterEvent, sendStatusFilterEvent, setSearchQuery, setUserStatusFilter]);

  const debouncedUpdateFilters = useMemo(() => debounce(
    updateFilters,
    DEBOUNCE_TIME_MILLIS,
  ), [updateFilters]);

  const debouncedSetCurrentPage = useMemo(() => debounce(
    setCurrentPage,
    DEBOUNCE_TIME_MILLIS,
  ), [setCurrentPage]);

  // Call back function, handles filters and page changes
  const fetchData = useCallback(
    (args) => {
      // pages index from 1 in backend, DataTable component index from 0
      if (args.pageIndex !== currentPage - 1) {
        debouncedSetCurrentPage(args.pageIndex + 1);
        sendPaginationEvent(currentPage - 1, args.pageIndex);
      }
      debouncedUpdateFilters(args.filters);
    },
    [currentPage, debouncedSetCurrentPage, debouncedUpdateFilters, sendPaginationEvent],
  );

  // Maps user to rows
  const rows = useMemo(
    () => users?.results?.map(user => ({
      id: user.uuid,
      email: user.userEmail,
      emailLabel: <span data-hj-suppress>{user.userEmail}</span>,
      status: user.status,
      statusBadge: <LicenseManagementUserBadge userStatus={user.status} />,
      recentAction: userRecentAction(user),
    })),
    [users],
  );

  const onEnrollSuccess = () => {
    forceRefreshUsers();
  };

  // Successful action modal callback
  const onRemindSuccess = () => {
    pushEvent(EVENTS.LPR_SUBSCRIPTION_LICENSE_REMIND, { enterpriseUUID: subscription.enterpriseCustomerUuid });
    // Refresh users to get updated lastRemindDate
    forceRefreshUsers();
    setToastMessage('Users successfully reminded');
    setShowToast(true);
  };
  const onRevokeSuccess = () => {
    pushEvent(EVENTS.LPR_SUBSCRIPTION_LICENSE_REVOKE, { enterpriseUUID: subscription.enterpriseCustomerUuid });
    // Refresh subscription and user data to get updated revoke count and revoked list of users
    forceRefreshSubscription();
    forceRefreshDetailView();
    setToastMessage('Licenses successfully revoked');
    setShowToast(true);
  };

  const showSubscriptionZeroStateMessage = subscription.licenses.total === subscription.licenses.unassigned;

  const tableActions = useMemo(() => {
    if (showSubscriptionZeroStateMessage) {
      return [];
    }
    return [<DownloadCsvButton />];
  }, [showSubscriptionZeroStateMessage]);

  return (
    <>
      {showSubscriptionZeroStateMessage && <SubscriptionZeroStateMessage /> }
      <DataTable
        showFiltersInSidebar={false}
        isLoading={loadingUsers}
        isFilterable
        manualFilters
        isSelectable={!isExpired}
        manualSelectColumn={selectColumn}
        SelectionStatusComponent={DataTable.ControlledSelectionStatus}
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        manualPagination
        itemCount={users.count}
        pageCount={users.numPages || 1}
        tableActions={tableActions}
        initialState={{
          pageSize: 5,
          pageIndex: DEFAULT_PAGE - 1,
        }}
        initialTableOptions={{
          getRowId: row => row.id,
        }}
        EmptyTableComponent={
          /* eslint-disable react/no-unstable-nested-components */
          () => {
            if (loadingUsers) {
              return null;
            }
            return <DataTable.EmptyTable content="No results found" />;
          }
          /* eslint-enable react/no-unstable-nested-components */
        }
        fetchData={fetchData}
        data={rows}
        columns={[
          {
            Header: 'Email address',
            accessor: 'emailLabel',
            /* eslint-disable react/prop-types */
            /* eslint-disable react/no-unstable-nested-components */
            Cell: ({ row }) => <span data-hj-suppress>{row.values.emailLabel}</span>,
            disableFilters: true,
            /* eslint-enable react/prop-types */
            /* eslint-enable react/no-unstable-nested-components */
          },
          {
            Header: 'Status',
            accessor: 'statusBadge',
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: [{
              name: 'Pending',
              number: overview.assigned,
              value: ASSIGNED,
            }, {
              name: 'Active',
              number: overview.activated,
              value: ACTIVATED,
            }],
            disableFilters: true,
          },
          {
            Header: 'Recent action',
            accessor: 'recentAction',
            disableFilters: true,
          },
        ]}
        additionalColumns={[
          {
            id: 'action',
            Header: '',
            /* eslint-disable react/prop-types */
            /* eslint-disable react/no-unstable-nested-components */
            Cell: ({ row }) => (
              <LicenseManagementTableActionColumn
                user={row.original}
                subscription={subscription}
                disabled={isExpired}
                onRemindSuccess={onRemindSuccess}
                onRevokeSuccess={onRevokeSuccess}
              />
              /* eslint-enable */
            ),
            /* eslint-enable react/prop-types */
            /* eslint-enable react/no-unstable-nested-components */
          },
        ]}
        bulkActions={[
          <EnrollBulkAction
            subscription={subscription}
            onEnrollSuccess={onEnrollSuccess}
          />,
          <RemindBulkAction
            subscription={subscription}
            activatedUsersCount={overview.activated}
            assignedUsersCount={overview.assigned}
            revokedUsersCount={overview.revoked}
            onRemindSuccess={onRemindSuccess}
          />,
          <RevokeBulkAction
            subscription={subscription}
            onRevokeSuccess={onRevokeSuccess}
            activatedUsersCount={overview.activated}
            assignedUsersCount={overview.assigned}
            revokedUsersCount={overview.revoked}
          />,
        ]}
      />
      {toastMessage && (
      <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>
      )}
    </>
  );
};

export default LicenseManagementTable;
