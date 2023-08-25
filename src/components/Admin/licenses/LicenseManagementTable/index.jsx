import _ from 'lodash';
import React, {
  useCallback, useMemo, useContext, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Toast,
} from '@edx/paragon';

import { SubscriptionContext } from '../../../subscriptions/SubscriptionData';
import { SubscriptionDetailContext } from '../../../subscriptions/SubscriptionDetailContextProvider';
import {
  DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED, API_FIELDS_BY_TABLE_COLUMN_ACCESSOR,
} from '../../../subscriptions/data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { formatTimestamp } from '../../../../utils';
import SubscriptionZeroStateMessage from '../../../subscriptions/SubscriptionZeroStateMessage';
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

const LicenseManagementTable = ({ subscriptionUUID }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const {
    forceRefresh: forceRefreshSubscription,
  } = useContext(SubscriptionContext);

  const {
    currentPage,
    sortBy,
    overview,
    forceRefreshDetailView,
    setSearchQuery,
    setCurrentPage,
    setSortBy,
    subscription,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
  } = useContext(SubscriptionDetailContext);

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

  const applySortBy = (requestedSortBy) => requestedSortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = API_FIELDS_BY_TABLE_COLUMN_ACCESSOR[id];
    if (!apiFieldForColumnAccessor) {
      return id;
    }
    if (desc) {
      return `-${apiFieldForColumnAccessor}`;
    }
    return apiFieldForColumnAccessor;
  });

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

  // Call back function, handles filters and page changes
  const fetchData = useCallback(
    (args) => {
      if (args.sortBy?.length > 0) {
        const sortByString = applySortBy(args.sortBy);
        if (!_.isEqual(sortByString, sortBy)) {
          setSortBy(sortByString);
        }
      }
      // pages index from 1 in backend, DataTable component index from 0
      if (args.pageIndex !== currentPage - 1) {
        setCurrentPage(args.pageIndex + 1);
        sendPaginationEvent(currentPage - 1, args.pageIndex);
      }
      debouncedUpdateFilters(args.filters);
    },
    [currentPage, setCurrentPage, debouncedUpdateFilters, sortBy, setSortBy, sendPaginationEvent],
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

  return (
    <div key={subscriptionUUID}>
      {showSubscriptionZeroStateMessage && <SubscriptionZeroStateMessage /> }
      <DataTable
        isSortable
        manualSortBy
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
    </div>
  );
};

LicenseManagementTable.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};
export default LicenseManagementTable;
