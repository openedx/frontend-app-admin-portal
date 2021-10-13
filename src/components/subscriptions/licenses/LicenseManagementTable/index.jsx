import React, {
  useCallback, useMemo, useContext, useState,
} from 'react';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  useWindowSize,
  breakpoints,
} from '@edx/paragon';
import debounce from 'lodash.debounce';

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
import LicenseManagementRevokeModal from '../LicenseManagementModals/LicenseManagementRevokeModal';
import LicenseManagementRemindModal from '../LicenseManagementModals/LicenseManagementRemindModal';
import LicenseManagementTableBulkActions from './LicenseManagementTableBulkActions';
import LicenseManagementTableActionColumn from './LicenseManagementTableActionColumn';
import LicenseManagementUserBadge from './LicenseManagementUserBadge';

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

const modalZeroState = {
  open: false,
  users: [],
  allUsersSelected: false,
};

const LicenseManagementTable = () => {
  const [remindModal, setRemindModal] = useState(modalZeroState);
  const [revokeModal, setRevokeModal] = useState(modalZeroState);

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

  // Filtering and pagination
  const updateFilters = (filters) => {
    if (filters.length < 1) {
      setSearchQuery(null);
      setUserStatusFilter(defaultStatusFilter);
    } else {
      filters.forEach((filter) => {
        switch (filter.id) {
          case 'statusBadge':
            setUserStatusFilter(filter.value.join());
            break;
          case 'emailLabel':
            setSearchQuery(filter.value);
            break;
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

  // Row action button functions
  const rowRemindOnClick = (remindUser) => {
    setRemindModal({
      open: true,
      users: [remindUser],
    });
  };
  const rowRevokeOnClick = (revokeUser) => {
    setRevokeModal({
      open: true,
      users: [revokeUser],
    });
  };

  // Successful action modal callback
  const onRemindSuccess = () => {
    forceRefreshUsers();
    setRemindModal(modalZeroState);
    addToast(`User${revokeModal.users.length > 1 ? 's' : ''} successfully reminded`);
  };
  const onRevokeSuccess = () => {
    // refresh subscription and user data to get updated revoke count and revoked user list
    forceRefreshSubscription();
    forceRefreshUsers();
    forceRefreshOverview();
    setRevokeModal(modalZeroState);
    addToast(`License${revokeModal.users.length > 1 ? 's' : ''} successfully revoked`);
  };

  // Bulk Action buttons
  const bulkRemindOnClick = (usersToRemind, allUsersSelected) => {
    setRemindModal({
      open: true,
      users: usersToRemind,
      allUsersSelected,
    });
  };
  const bulkRevokeOnClick = (usersToRevoke, allUsersSelected) => {
    setRevokeModal({
      open: true,
      users: usersToRevoke,
      allUsersSelected,
    });
  };

  const showSubscriptionZeroStateMessage = subscription.licenses.total === subscription.licenses.unassigned;
  return (
    <>
      {showSubscriptionZeroStateMessage && <SubscriptionZeroStateMessage /> }

      <DataTable
        showFiltersInSidebar={showFiltersInSidebar}
        isFilterable
        manualFilters
        isSelectable
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
          return <></>;
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: DEFAULT_PAGE - 1,
        }}
        initialTableOptions={{
          getRowId: row => row.id,
        }}
        EmptyTableComponent={
          () => <DataTable.EmptyTable content={loadingUsers ? 'Loading...' : 'No results found...'} />
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
                rowRemindOnClick={rowRemindOnClick}
                rowRevokeOnClick={rowRevokeOnClick}
              />
              /* eslint-enable */
            ),
          },
        ]}
        bulkActions={(data) => {
          const selectedUsers = data.selectedFlatRows.map((selectedRow) => selectedRow.original);
          return (
            <LicenseManagementTableBulkActions
              selectedUsers={selectedUsers}
              bulkRemindOnClick={bulkRemindOnClick}
              bulkRevokeOnClick={bulkRevokeOnClick}
              activatedUsers={overview.activated}
              assignedUsers={overview.assigned}
              allUsersSelected={data.isEntireTableSelected}
            />
          );
        }}
      />

      <LicenseManagementRevokeModal
        isOpen={revokeModal.open}
        usersToRevoke={revokeModal.users}
        subscription={subscription}
        onClose={() => setRevokeModal(modalZeroState)}
        onSuccess={onRevokeSuccess}
        revokeAllUsers={revokeModal.allUsersSelected}
        totalToRevoke={overview.activated + overview.assigned}
      />
      <LicenseManagementRemindModal
        isOpen={remindModal.open}
        usersToRemind={remindModal.users}
        subscription={subscription}
        onClose={() => setRemindModal(modalZeroState)}
        onSuccess={onRemindSuccess}
        remindAllUsers={remindModal.allUsersSelected}
        totalToRemind={overview.assigned}
      />
    </>
  );
};

export default LicenseManagementTable;
