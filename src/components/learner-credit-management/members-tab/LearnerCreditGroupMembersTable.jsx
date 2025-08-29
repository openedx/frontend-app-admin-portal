import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, Dropdown, Icon, IconButton,
} from '@openedx/paragon';
import { MoreVert, RemoveCircle } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import TableTextFilter from '../TableTextFilter';
import CustomDataTableEmptyState from '../CustomDataTableEmptyState';
import MemberDetailsTableCell from './MemberDetailsTableCell';
import MemberStatusTableCell from './MemberStatusTableCell';
import MemberStatusTableColumnHeader from './MemberStatusTableColumnHeader';
import MemberEnrollmentsTableColumnHeader from './MemberEnrollmentsTableColumnHeader';
import MemberRemoveAction from './bulk-actions/MemberRemoveAction';
import MemberRemoveModal from './bulk-actions/MemberRemoveModal';
import { DEFAULT_PAGE, MEMBERS_TABLE_PAGE_SIZE } from '../data';
import useRemoveMember from '../data/hooks/useRemoveMember';
import GroupMembersCsvDownloadTableAction from './GroupMembersCsvDownloadTableAction';
import MembersTableSwitchFilter from './MembersTableSwitchFilter';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const KabobMenu = ({
  row, groupUuid, refresh, setRefresh,
}) => {
  const {
    totalToRemove, removeModal, handleRemoveClick, handleRemoveCancel, handleRemoveSuccess,
  } = useRemoveMember([row], false, null, refresh, setRefresh);
  if (row.original.status === 'removed') {
    return null;
  }
  return (
    <>
      <Dropdown drop="top">
        <Dropdown.Toggle
          id="kabob-menu-dropdown"
          data-testid="kabob-menu-dropdown"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={handleRemoveClick}>
            <Icon src={RemoveCircle} className="mr-2 text-danger-500" />
            <FormattedMessage
              id="learnerCreditManagement.budgetDetail.membersTab.kabobMenu.removeMember"
              defaultMessage="Remove member"
              description="Remove member option in the kabob menu"
            />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <MemberRemoveModal
        isOpen={removeModal.isOpen}
        usersToRemove={removeModal.users}
        onClose={handleRemoveCancel}
        onSuccess={handleRemoveSuccess}
        removeAllUsers={removeModal.allUsersSelected}
        totalToRemove={totalToRemove}
        groupUuid={groupUuid}
        isRemoveIndividualUser
      />
    </>
  );
};

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const LearnerCreditGroupMembersTable = ({
  isLoading,
  tableData,
  fetchTableData,
  refresh,
  setRefresh,
  groupUuid,
  removedGroupMembersCount,
}) => {
  const intl = useIntl();
  return (
    <span className="budget-detail-assignments">
      <DataTable
        isSortable
        manualSortBy
        isSelectable
        SelectionStatusComponent={DataTable.ControlledSelectionStatus}
        manualSelectColumn={selectColumn}
        isPaginated
        manualPagination
        isFilterable
        manualFilters
        isLoading={isLoading}
        defaultColumnValues={{ Filter: TableTextFilter }}
        FilterStatusComponent={FilterStatus}
        numBreakoutFilters={2}
        tableActions={[<GroupMembersCsvDownloadTableAction />]}
        columns={[
          {
            Header: intl.formatMessage({
              id: 'learnerCreditManagement.budgetDetail.membersTab.columns.memberDetails',
              defaultMessage: 'Member Details',
              description: 'Column header for the Member Details column in the Members tab of the Budget Detail page',
            }),
            accessor: 'memberDetails',
            Cell: MemberDetailsTableCell,
          },
          {
            Header: MemberStatusTableColumnHeader,
            accessor: 'status',
            Cell: MemberStatusTableCell,
            Filter: removedGroupMembersCount > 0 ? (
              <MembersTableSwitchFilter removedGroupMembersCount={removedGroupMembersCount} />
            ) : <div />,
            filter: 'status',
          },
          {
            Header: intl.formatMessage({
              id: 'learnerCreditManagement.budgetDetail.membersTab.columns.recentAction',
              defaultMessage: 'Recent action',
              description: 'Column header for the Recent action column in the Members tab of the Budget Detail page',
            }),
            accessor: 'recentAction',
            Cell: ({ row }) => row.original.recentAction,
            disableFilters: true,
          },
          {
            Header: MemberEnrollmentsTableColumnHeader,
            accessor: 'enrollmentCount',
            Cell: ({ row }) => row.original.enrollmentCount,
            disableFilters: true,
          },
        ]}
        initialTableOptions={{
          getRowId: row => row?.memberDetails.userEmail,
          autoResetPage: true,
        }}
        initialState={{
          pageSize: MEMBERS_TABLE_PAGE_SIZE,
          pageIndex: DEFAULT_PAGE,
          sortBy: [
            { id: 'memberDetails', desc: true },
          ],
          filters: [],
        }}
        bulkActions={[
          <MemberRemoveAction
            refresh={refresh}
            setRefresh={setRefresh}
            groupUuid={groupUuid}
          />,
          <GroupMembersCsvDownloadTableAction />,
        ]}
        additionalColumns={[
          {
            id: 'action',
            Header: '',
            // eslint-disable-next-line react/no-unstable-nested-components
            Cell: (props) => (
              <KabobMenu {...props} groupUuid={groupUuid} refresh={refresh} setRefresh={setRefresh} />
            ),
          },
        ]}
        fetchData={fetchTableData}
        data={tableData.results}
        itemCount={tableData.itemCount}
        pageCount={tableData.pageCount}
        EmptyTableComponent={CustomDataTableEmptyState}
      />
    </span>
  );
};

KabobMenu.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  groupUuid: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
};

LearnerCreditGroupMembersTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
  removedGroupMembersCount: PropTypes.number.isRequired,
};

export default LearnerCreditGroupMembersTable;
