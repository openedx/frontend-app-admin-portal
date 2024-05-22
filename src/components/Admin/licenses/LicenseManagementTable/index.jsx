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
import { useIntl } from '@edx/frontend-platform/i18n';

import { SubscriptionContext } from '../../../subscriptions/SubscriptionData';
import { SubscriptionDetailContext } from '../../../subscriptions/SubscriptionDetailContextProvider';
import {
  DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED, API_FIELDS_BY_TABLE_COLUMN_ACCESSOR,
} from '../../../subscriptions/data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../../algoliaUtils';
import { i18nFormatTimestamp } from '../../../../utils';
import SubscriptionZeroStateMessage from '../../../subscriptions/SubscriptionZeroStateMessage';
import EnrollBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/EnrollBulkAction';
import RemindBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/RemindBulkAction';
import RevokeBulkAction from '../../../subscriptions/licenses/LicenseManagementTable/bulk-actions/RevokeBulkAction';
import LicenseManagementTableActionColumn from '../../../subscriptions/licenses/LicenseManagementTable/LicenseManagementTableActionColumn';
import LicenseManagementUserBadge from '../../../subscriptions/licenses/LicenseManagementTable/LicenseManagementUserBadge';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';
import { pushEvent, EVENTS } from '../../../../optimizely';

const userRecentAction = (user, intl) => {
  switch (user.status) {
    case ACTIVATED: {
      return intl.formatMessage({
        id: 'admin.portal.lpr.embedded.subscription.license.management.table.user.recent.action.activated',
        defaultMessage: 'Activated: {activationDate}',
        description: 'Activated action date for a user in the license management table.',
      }, { activationDate: i18nFormatTimestamp({ intl, timestamp: user.activationDate }) });
    }
    case REVOKED: {
      return intl.formatMessage({
        id: 'admin.portal.lpr.embedded.subscription.license.management.table.user.recent.action.revoked',
        defaultMessage: 'Revoked: {revokedDate}',
        description: 'Revoked action date for a user in the license management table.',
      }, { revokedDate: i18nFormatTimestamp({ intl, timestamp: user.revokedDate }) });
    }
    case ASSIGNED: {
      return intl.formatMessage({
        id: 'admin.portal.lpr.embedded.subscription.license.management.table.user.recent.action.invited',
        defaultMessage: 'Invited: {lastRemindDate}',
        description: 'Invited action date for a user in the license management table.',
      }, { lastRemindDate: i18nFormatTimestamp({ intl, timestamp: user.lastRemindDate }) });
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
  const intl = useIntl();

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
      recentAction: userRecentAction(user, intl),
    })),
    [users, intl],
  );

  const onEnrollSuccess = () => {
    forceRefreshUsers();
  };

  // Successful action modal callback
  const onRemindSuccess = () => {
    pushEvent(EVENTS.LPR_SUBSCRIPTION_LICENSE_REMIND, { enterpriseUUID: subscription.enterpriseCustomerUuid });
    // Refresh users to get updated lastRemindDate
    forceRefreshUsers();
    setToastMessage(intl.formatMessage({
      id: 'admin.portal.lpr.embedded.subscription.license.management.table.reminded.toast',
      defaultMessage: 'Users successfully reminded',
      description: 'Toast message for reminding users in the license management table.',
    }));
    setShowToast(true);
  };
  const onRevokeSuccess = () => {
    pushEvent(EVENTS.LPR_SUBSCRIPTION_LICENSE_REVOKE, { enterpriseUUID: subscription.enterpriseCustomerUuid });
    // Refresh subscription and user data to get updated revoke count and revoked list of users
    forceRefreshSubscription();
    forceRefreshDetailView();
    setToastMessage(intl.formatMessage({
      id: 'admin.portal.lpr.embedded.subscription.license.management.table.revoked.toast',
      defaultMessage: 'Licenses successfully revoked',
      description: 'Toast message for revoking users in the license management table.',
    }));
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
            return (
              <DataTable.EmptyTable
                content={intl.formatMessage({
                  id: 'admin.portal.lpr.embedded.subscription.license.management.table.empty.content',
                  defaultMessage: 'No results found',
                  description: 'Empty table content for the license management table.',
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
              id: 'admin.portal.lpr.embedded.subscription.license.management.table.column.email.heading',
              defaultMessage: 'Email address',
              description: 'Column heading for the email address column in the license management table.',
            }),
            accessor: 'emailLabel',
            /* eslint-disable react/prop-types */
            /* eslint-disable react/no-unstable-nested-components */
            Cell: ({ row }) => <span data-hj-suppress>{row.values.emailLabel}</span>,
            disableFilters: true,
            /* eslint-enable react/prop-types */
            /* eslint-enable react/no-unstable-nested-components */
          },
          {
            Header: intl.formatMessage({
              id: 'admin.portal.lpr.embedded.subscription.license.management.table.column.status.heading',
              defaultMessage: 'Status',
              description: 'Column heading for the status column in the license management table.',
            }),
            accessor: 'statusBadge',
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: [{
              name: intl.formatMessage({
                id: 'admin.portal.lpr.embedded.subscription.license.management.table.pending.filter',
                defaultMessage: 'Pending',
                description: 'Filter option for pending status in the license management table.',
              }),
              number: overview.assigned,
              value: ASSIGNED,
            }, {
              name: intl.formatMessage({
                id: 'admin.portal.lpr.embedded.subscription.license.management.table.active.filter',
                defaultMessage: 'Active',
                description: 'Filter option for active status in the license management table.',
              }),
              number: overview.activated,
              value: ACTIVATED,
            }],
            disableFilters: true,
          },
          {
            Header: intl.formatMessage({
              id: 'admin.portal.lpr.embedded.subscription.license.management.table.column.recent.action.heading',
              defaultMessage: 'Recent action',
              description: 'Column heading for the recent action column in the license management table.',
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
