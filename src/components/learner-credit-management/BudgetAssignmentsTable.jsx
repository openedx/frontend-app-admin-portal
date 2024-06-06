import React from 'react';
import PropTypes from 'prop-types';
import { DataTable, CheckboxFilter } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import TableTextFilter from './TableTextFilter';
import CustomDataTableEmptyState from './CustomDataTableEmptyState';
import AssignmentDetailsTableCell from './AssignmentDetailsTableCell';
import AssignmentStatusTableCell from './AssignmentStatusTableCell';
import AssignmentRowActionTableCell from './AssignmentRowActionTableCell';
import AssignmentTableRemindAction from './AssignmentTableRemind';
import AssignmentTableCancelAction from './AssignmentTableCancel';
import { DEFAULT_PAGE, PAGE_SIZE, formatPrice } from './data';
import AssignmentRecentActionTableCell from './AssignmentRecentActionTableCell';
import AssignmentsTableRefreshAction from './AssignmentsTableRefreshAction';
import AssignmentEnrollByDateCell from './AssignmentEnrollByDateCell';
import AssignmentEnrollByDateHeader from './AssignmentEnrollByDateHeader';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const getLearnerStateDisplayName = (learnerState) => {
  if (learnerState === 'notifying') {
    return 'Notifying learner';
  }
  if (learnerState === 'waiting') {
    return 'Waiting for learner';
  }
  if (learnerState === 'failed') {
    return 'Failed';
  }

  return undefined;
};

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const BudgetAssignmentsTable = ({
  isLoading,
  tableData,
  fetchTableData,
}) => {
  const intl = useIntl();
  const statusFilterChoices = tableData.learnerStateCounts
    .filter(({ learnerState }) => !!getLearnerStateDisplayName(learnerState))
    .map(({ learnerState, count }) => ({
      name: getLearnerStateDisplayName(learnerState),
      number: count,
      value: learnerState,
    }));

  return (
    <DataTable
      isSortable
      isSelectable
      manualSortBy
      isPaginated
      manualPagination
      isFilterable
      manualFilters
      isLoading={isLoading}
      defaultColumnValues={{ Filter: TableTextFilter }}
      manualSelectColumn={selectColumn}
      FilterStatusComponent={FilterStatus}
      SelectionStatusComponent={DataTable.ControlledSelectionStatus}
      columns={[
        {
          Header:
          intl.formatMessage({
            id: 'lcm.budget.detail.page.assignments.table.columns.assignment.details',
            defaultMessage: 'Assignment details',
            description: 'Column header for the assignment details column in the assignments table',
          }),
          accessor: 'assignmentDetails',
          Cell: AssignmentDetailsTableCell,
          disableSortBy: true,
        },
        {
          Header:
          intl.formatMessage({
            id: 'lcm.budget.detail.page.assignments.table.columns.amount',
            defaultMessage: 'Amount',
            description: 'Column header for the amount column in the assignments table',
          }),
          accessor: 'amount',
          Cell: ({ row }) => `-${formatPrice(row.original.contentQuantity / 100)}`,
          disableFilters: true,
        },
        {
          Header:
          intl.formatMessage({
            id: 'lcm.budget.detail.page.assignments.table.columns.status',
            defaultMessage: 'Status',
            description: 'Column header for the status column in the assignments table',
          }),
          accessor: 'learnerState',
          Cell: AssignmentStatusTableCell,
          Filter: CheckboxFilter,
          filter: 'includesValue',
          filterChoices: statusFilterChoices,
        },
        {
          Header:
          intl.formatMessage({
            id: 'lcm.budget.detail.page.assignments.table.columns.recent.action',
            defaultMessage: 'Recent action',
            description: 'Column header for the recent action column in the assignments table',
          }),
          accessor: 'recentAction',
          Cell: AssignmentRecentActionTableCell,
          disableFilters: true,
        },
        {
          Header: AssignmentEnrollByDateHeader,
          headerClassName: 'justify-content-center',
          accessor: 'earliestPossibleExpiration',
          Cell: AssignmentEnrollByDateCell,
          disableFilters: true,
          disableSortBy: true,
        },
      ]}
      additionalColumns={[
        {
          Header: '',
          Cell: AssignmentRowActionTableCell,
          id: 'action',
        },
      ]}
      tableActions={[
        <AssignmentsTableRefreshAction refresh={fetchTableData} />,
      ]}
      initialTableOptions={{
        getRowId: row => row?.uuid?.toString(),
      }}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [{
          id: 'recentAction',
          desc: true,
        }],
        filters: [],
      }}
      fetchData={fetchTableData}
      data={tableData.results || []}
      itemCount={tableData.count || 0}
      pageCount={tableData.numPages || 1}
      EmptyTableComponent={CustomDataTableEmptyState}
      bulkActions={[
        <AssignmentTableRemindAction learnerStateCounts={tableData.learnerStateCounts} />,
        <AssignmentTableCancelAction learnerStateCounts={tableData.learnerStateCounts} />,
      ]}
    />
  );
};

BudgetAssignmentsTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape()),
    learnerStateCounts: PropTypes.arrayOf(PropTypes.shape({
      learnerState: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })).isRequired,
    count: PropTypes.number.isRequired,
    numPages: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default BudgetAssignmentsTable;
