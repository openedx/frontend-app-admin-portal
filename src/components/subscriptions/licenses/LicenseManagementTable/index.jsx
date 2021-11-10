import React, {
  useCallback, useMemo, useContext,
} from 'react';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  useWindowSize,
  breakpoints,
} from '@edx/paragon';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { SubscriptionContext } from '../../SubscriptionData';
import { SubscriptionDetailContext, defaultStatusFilter } from '../../SubscriptionDetailContextProvider';
import {
  PAGE_SIZE, DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED,
} from '../../data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { ToastsContext } from '../../../Toasts';
import { formatTimestamp } from '../../../../utils';
import SubscriptionZeroStateMessage from '../../SubscriptionZeroStateMessage';
import DownloadCsvButton from '../../buttons/DownloadCsvButton';
import LicenseManagementTableBulkActions from './LicenseManagementTableBulkActions';
import LicenseManagementTableActionColumn from './LicenseManagementTableActionColumn';
import LicenseManagementUserBadge from './LicenseManagementUserBadge';
import { subscriptionsTableEventNames } from '../../../../eventTracking';

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

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const LicenseManagementTable = () => {
  const { addToast } = useContext(ToastsContext);

  const { width } = useWindowSize();
  const showFiltersInSidebar = useMemo(() => width > breakpoints.medium.maxWidth, [width]);

  const {
    forceRefresh: forceRefreshSubscription,
  } = useContext(SubscriptionContext);

  const {
    currentPage,
    overview,
    forceRefresh: forceRefreshOverview,
    setSearchQuery,
    setCurrentPage,
    subscription,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
  } = useContext(SubscriptionDetailContext);

  const isExpired = moment().isAfter(subscription.expirationDate);
  // this is not the cleanest way of getting this, but this will be removed when the
  // enrollment modal is implemented
  const enrollmentLink = (window.location.href).replace('subscriptions', 'enrollment');

  const sendStatusFilterEvent = (statusFilter) => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      subscriptionsTableEventNames.filterStatusChange,
      { applied_filters: statusFilter },
    );
  };

  const sendEmailFilterEvent = (emailFilter) => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      subscriptionsTableEventNames.filterEmailChange,
      { email_filter: emailFilter },
    );
  };

  const sendPaginationEvent = (oldPage, newPage) => {
    const eventName = newPage - oldPage > 0
      ? subscriptionsTableEventNames.paginationNext
      : subscriptionsTableEventNames.paginationPrevious;

    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      eventName,
      { page: newPage },
    );
  };

  // Filtering and pagination
  const updateFilters = (filters) => {
    if (filters.length < 1) {
      setSearchQuery(null);
      setUserStatusFilter(defaultStatusFilter);
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
            sendEmailFilterEvent(filter.value);
            setSearchQuery(filter.value);
            break;
          }
          default: break;
        }
      });
    }
  };

  const debouncedUpdateFilters = debounce(
    updateFilters,
    DEBOUNCE_TIME_MILLIS,
  );

  const debouncedSetCurrentPage = debounce(
    setCurrentPage,
    DEBOUNCE_TIME_MILLIS,
  );
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
    [currentPage],
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

  // Successful action modal callback
  const onRemindSuccess = (clearTableSelectionCallback) => (() => {
    clearTableSelectionCallback();
    forceRefreshUsers();
    addToast('Users successfully reminded');
  });
  const onRevokeSuccess = (clearTableSelectionCallback) => (() => {
    // refresh subscription and user data to get updated revoke count and revoked user list
    clearTableSelectionCallback();
    forceRefreshSubscription();
    forceRefreshUsers();
    forceRefreshOverview();
    addToast('Licenses successfully revoked');
  });

  const showSubscriptionZeroStateMessage = subscription.licenses.total === subscription.licenses.unassigned;
  return (
    <>
      {showSubscriptionZeroStateMessage && <SubscriptionZeroStateMessage /> }
      <DataTable
        showFiltersInSidebar={showFiltersInSidebar}
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
        // eslint-disable-next-line no-unused-vars
        tableActions={(i) => {
          if (!showSubscriptionZeroStateMessage) {
            return <DownloadCsvButton />;
          }
          return null;
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: DEFAULT_PAGE - 1,
        }}
        initialTableOptions={{
          getRowId: row => row.id,
        }}
        EmptyTableComponent={
          () => <DataTable.EmptyTable content={loadingUsers ? 'Loading...' : 'No results found'} />
        }
        fetchData={fetchData}
        data={rows}
        columns={[
          {
            Header: 'Email address',
            accessor: 'emailLabel',
          },
          {
            Header: 'Status',
            accessor: 'statusBadge',
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: [{
              name: 'Active',
              number: overview.activated,
              value: ACTIVATED,
            },
            {
              name: 'Pending',
              number: overview.assigned,
              value: ASSIGNED,
            },
            {
              name: 'Revoked',
              number: overview.revoked,
              value: REVOKED,
            }],
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
          },
        ]}
        bulkActions={(data) => {
          const selectedUsers = data.selectedFlatRows.map((selectedRow) => selectedRow.original);
          const { clearSelection } = data.tableInstance;
          return (
            <LicenseManagementTableBulkActions
              subscription={subscription}
              enrollmentLink={enrollmentLink}
              selectedUsers={selectedUsers}
              onRemindSuccess={onRemindSuccess(clearSelection)}
              onRevokeSuccess={onRevokeSuccess(clearSelection)}
              activatedUsers={overview.activated}
              assignedUsers={overview.assigned}
              allUsersSelected={data.isEntireTableSelected}
              disabled={isExpired}
            />
          );
        }}
      />
    </>
  );
};

export default LicenseManagementTable;
