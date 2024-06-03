import React, {
  useCallback, useMemo, useContext, useState,
} from 'react';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  useWindowSize,
  breakpoints,
  Toast,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useIntl } from '@edx/frontend-platform/i18n';
import { SubscriptionContext } from '../../SubscriptionData';
import { SubscriptionDetailContext, defaultStatusFilter } from '../../SubscriptionDetailContextProvider';
import {
  PAGE_SIZE, DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED,
} from '../../data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { formatTimestamp } from '../../../../utils';
import SubscriptionZeroStateMessage from '../../SubscriptionZeroStateMessage';
import DownloadCsvButton from '../../buttons/DownloadCsvButton';
import EnrollBulkAction from './bulk-actions/EnrollBulkAction';
import RemindBulkAction from './bulk-actions/RemindBulkAction';
import RevokeBulkAction from './bulk-actions/RevokeBulkAction';
import LicenseManagementTableActionColumn from './LicenseManagementTableActionColumn';
import LicenseManagementUserBadge from './LicenseManagementUserBadge';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';

const userRecentAction = (user, intl) => {
  switch (user.status) {
    case ACTIVATED: {
      return intl.formatMessage({
        id: 'admin.portal.license.management.user.recent.action.activated.label',
        defaultMessage: 'Activated: {timestamp}',
        description: 'Message for activated status with timestamp in license management table.',
      }, { timestamp: formatTimestamp({ timestamp: user.activationDate }) });
    }
    case REVOKED: {
      return intl.formatMessage({
        id: 'admin.portal.license.management.user.recent.action.revoked.label',
        defaultMessage: 'Revoked: {timestamp}',
        description: 'Message for revoked status with timestamp in license management table.',
      }, { timestamp: formatTimestamp({ timestamp: user.revokedDate }) });
    }
    case ASSIGNED: {
      return intl.formatMessage({
        id: 'admin.portal.license.management.user.recent.action.invited.label',
        defaultMessage: 'Invited: {timestamp}',
        description: 'Message for invited status with timestamp in license management table.',
      }, { timestamp: formatTimestamp({ timestamp: user.lastRemindDate }) });
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { width } = useWindowSize();
  const showFiltersInSidebar = useMemo(() => width > breakpoints.medium.maxWidth, [width]);

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

  const intl = useIntl();

  const isExpired = dayjs().isAfter(subscription.expirationDate);

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
      recentAction: userRecentAction(user, intl),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users],
  );

  const onEnrollSuccess = () => {
    forceRefreshUsers();
  };

  // Successful action modal callback
  const onRemindSuccess = () => {
    // Refresh users to get updated lastRemindDate
    forceRefreshUsers();
    const toastMessageText = intl.formatMessage({
      id: 'admin.portal.license.management.on.remind.success.toast.message',
      defaultMessage: 'Users successfully reminded',
      description: 'Toast message displayed when users are successfully reminded.',
    });
    setToastMessage(toastMessageText);
    setShowToast(true);
  };
  const onRevokeSuccess = () => {
    // Refresh subscription and user data to get updated revoke count and revoked list of users
    forceRefreshSubscription();
    forceRefreshDetailView();
    const toastMessageText = intl.formatMessage({
      id: 'admin.portal.license.management.on.revoke.success.toast.message',
      defaultMessage: 'Licenses successfully revoked',
      description: 'Toast message displayed when licenses are successfully revoked.',
    });
    setToastMessage(toastMessageText);
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
        showFiltersInSidebar={showFiltersInSidebar}
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
          pageSize: PAGE_SIZE,
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
              return (
                <DataTable.EmptyTable
                  content={intl.formatMessage({
                    id: 'admin.portal.license.management.empty.table.no.results.label',
                    defaultMessage: 'No results found',
                    description: 'Message displayed when no results are found in license management table.',
                  })}
                />
              );
            }
            /* eslint-enable react/no-unstable-nested-components */
          }
        fetchData={fetchData}
        data={rows}
        columns={[
          {
            Header: intl.formatMessage({
              id: 'admin.portal.license.management.table.column.email',
              defaultMessage: 'Email address',
              description: 'Header label for the email address column in the license management table.',
            }),
            accessor: 'emailLabel',
            /* eslint-disable react/prop-types */
            /* eslint-disable react/no-unstable-nested-components */
            Cell: ({ row }) => <span data-hj-suppress>{row.values.emailLabel}</span>,
            /* eslint-enable react/prop-types */
            /* eslint-enable react/no-unstable-nested-components */
          },
          {
            Header: intl.formatMessage({
              id: 'admin.portal.license.management.table.column.status',
              defaultMessage: 'Status',
              description: 'Header label for the status column in the license management table.',
            }),
            accessor: 'statusBadge',
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: [
              {
                name: intl.formatMessage({
                  id: 'admin.portal.license.management.filter.choice.active',
                  defaultMessage: 'Active',
                  description: 'Label for the active status filter choice in the license management table.',
                }),
                number: overview.activated,
                value: ACTIVATED,
              },
              {
                name: intl.formatMessage({
                  id: 'admin.portal.license.management.filter.choice.pending',
                  defaultMessage: 'Pending',
                  description: 'Label for the pending status filter choice in the license management table.',
                }),
                number: overview.assigned,
                value: ASSIGNED,
              },
              {
                name: intl.formatMessage({
                  id: 'admin.portal.license.management.filter.choice.revoked',
                  defaultMessage: 'Revoked',
                  description: 'Label for the revoked status filter choice in the license management table.',
                }),
                number: overview.revoked,
                value: REVOKED,
              },
            ],
          },
          {
            Header: intl.formatMessage({
              id: 'admin.portal.license.management.table.column.recent.action',
              defaultMessage: 'Recent action',
              description: 'Header label for the recent action column in the license management table.',
            }),
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
