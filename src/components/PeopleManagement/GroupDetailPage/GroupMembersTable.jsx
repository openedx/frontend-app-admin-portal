import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, Dropdown, Icon, IconButton, useToggle,
} from '@openedx/paragon';
import { MoreVert, RemoveCircle } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import TableTextFilter from '../../learner-credit-management/TableTextFilter';
import CustomDataTableEmptyState from '../../learner-credit-management/CustomDataTableEmptyState';
import MemberDetailsTableCell from '../../learner-credit-management/members-tab/MemberDetailsTableCell';
import {
  GROUP_MEMBERS_TABLE_DEFAULT_PAGE,
  GROUP_MEMBERS_TABLE_PAGE_SIZE,
} from '../constants';
import RecentActionTableCell from '../RecentActionTableCell';
import DownloadCsvIconButton from './DownloadCsvIconButton';
import RemoveMemberModal from './RemoveMemberModal';
import GeneralErrorModal from '../GeneralErrorModal';
import AddMemberTableAction from './AddMemberTableAction';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const KabobMenu = ({
  groupUuid, refresh, row, setRefresh,
}) => {
  const [isRemoveModalOpen, openRemoveModal, closeRemoveModal] = useToggle(false);
  const [isErrorModalOpen, openErrorModal, closeErrorModal] = useToggle(false);
  return (
    <>
      <RemoveMemberModal
        groupUuid={groupUuid}
        row={row}
        isOpen={isRemoveModalOpen}
        close={closeRemoveModal}
        openError={openErrorModal}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      <GeneralErrorModal
        isOpen={isErrorModalOpen}
        close={closeErrorModal}
      />
      <Dropdown drop="top">
        <Dropdown.Toggle
          id="kabob-menu-dropdown"
          data-testid="kabob-menu-dropdown"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt="Kabob menu dropdown"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={openRemoveModal}>
            <Icon src={RemoveCircle} className="mr-2 text-danger-500" />
            <FormattedMessage
              id="people.management.budgetDetail.membersTab.kabobMenu.removeMember"
              defaultMessage="Remove member"
              description="Remove member option in the kabob menu"
            />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

KabobMenu.propTypes = {
  groupUuid: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
  row: PropTypes.shape({}).isRequired,
  setRefresh: PropTypes.func.isRequired,
};

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const GroupMembersTable = ({
  dataCount,
  fetchAllData,
  fetchTableData,
  groupName,
  groupUuid,
  isLoading,
  openAddMembersModal,
  refresh,
  setRefresh,
  tableData,
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
        columns={[
          {
            Header: intl.formatMessage({
              id: 'people.management.groups.detail.page.members.columns.memberDetails',
              defaultMessage: 'Member details',
              description: 'Column header for the Member details column in the People management Groups detail page',
            }),
            accessor: 'memberDetails',
            Cell: MemberDetailsTableCell,
          },
          {
            Header: intl.formatMessage({
              id: 'people.management.groups.detail.page.members.columns.recentAction',
              defaultMessage: 'Recent action',
              description: 'Column header for the Recent action column in the People management Groups detail page',
            }),
            accessor: 'recentAction',
            Cell: RecentActionTableCell,
            disableFilters: true,
          },
          {
            Header: intl.formatMessage({
              id: 'people.management.groups.detail.page.members.columns.enrollments',
              defaultMessage: 'Enrollments',
              description: 'Enrollments column header in the Members table in the People management Groups detail page',
            }),
            accessor: 'enrollmentCount',
            Cell: ({ row }) => row.original.enrollments,
            disableFilters: true,
          },
        ]}
        initialTableOptions={{
          getRowId: row => row?.memberDetails.userEmail,
          autoResetPage: true,
        }}
        initialState={{
          pageSize: GROUP_MEMBERS_TABLE_PAGE_SIZE,
          pageIndex: GROUP_MEMBERS_TABLE_DEFAULT_PAGE,
          sortBy: [{ id: 'memberDetails', desc: true }],
          filters: [],
        }}
        additionalColumns={[
          {
            id: 'action',
            Header: '',
            // eslint-disable-next-line react/no-unstable-nested-components
            Cell: (props) => (
              <KabobMenu
                {...props}
                groupUuid={groupUuid}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ),
          },
        ]}
        tableActions={[
          <AddMemberTableAction openModal={openAddMembersModal} />,
          <DownloadCsvIconButton
            fetchAllData={fetchAllData}
            dataCount={dataCount}
            testId="group-members-download"
            groupName={groupName}
          />,
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

GroupMembersTable.propTypes = {
  dataCount: PropTypes.number.isRequired,
  fetchAllData: PropTypes.func.isRequired,
  fetchTableData: PropTypes.func.isRequired,
  groupName: PropTypes.string,
  groupUuid: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  openAddMembersModal: PropTypes.func.isRequired,
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({})),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default GroupMembersTable;
