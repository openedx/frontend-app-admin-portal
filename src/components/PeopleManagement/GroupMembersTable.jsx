import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, Dropdown, Icon, IconButton,
} from '@openedx/paragon';
import { MoreVert, RemoveCircle } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import TableTextFilter from '../learner-credit-management/TableTextFilter';
import CustomDataTableEmptyState from '../learner-credit-management/CustomDataTableEmptyState';
import MemberDetailsTableCell from '../learner-credit-management/members-tab/MemberDetailsTableCell';
import { DEFAULT_PAGE, MEMBERS_TABLE_PAGE_SIZE } from '../learner-credit-management/data';
import EnrollmentsTableColumnHeader from './EnrollmentsTableColumnHeader';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const KabobMenu = () => (
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
      <Dropdown.Item>
        <Icon src={RemoveCircle} className="mr-2 text-danger-500" />
        <FormattedMessage
          id="people.management.budgetDetail.membersTab.kabobMenu.removeMember"
          defaultMessage="Remove member"
          description="Remove member option in the kabob menu"
        />
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const GroupMembersTable = ({
  isLoading,
  tableData,
  fetchTableData,
  groupUuid,
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
              defaultMessage: 'Member Details',
              description: 'Column header for the Member Details column in the People management Groups detail page',
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
            Cell: ({ row }) => row.original.recentAction,
            disableFilters: true,
          },
          {
            Header: EnrollmentsTableColumnHeader,
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
          pageSize: MEMBERS_TABLE_PAGE_SIZE,
          pageIndex: DEFAULT_PAGE,
          sortBy: [
            { id: 'memberDetails', desc: true },
          ],
          filters: [],
        }}
        additionalColumns={[
          {
            id: 'action',
            Header: '',
            // eslint-disable-next-line react/no-unstable-nested-components
            Cell: (props) => (
              <KabobMenu {...props} groupUuid={groupUuid} />
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

GroupMembersTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
};

export default GroupMembersTable;
