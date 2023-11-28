import React from 'react';
import PropTypes from 'prop-types';
import { DataTable, CheckboxFilter } from '@edx/paragon';
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
          Header: 'Assignment details',
          accessor: 'assignmentDetails',
          Cell: AssignmentDetailsTableCell,
          disableSortBy: true,
        },
        {
          Header: 'Amount',
          accessor: 'amount',
          Cell: ({ row }) => `-${formatPrice(row.original.contentQuantity / 100)}`,
          disableFilters: true,
        },
        {
          Header: 'Status',
          accessor: 'learnerState',
          Cell: AssignmentStatusTableCell,
          Filter: CheckboxFilter,
          filter: 'includesValue',
          filterChoices: statusFilterChoices,
        },
        {
          Header: 'Recent action',
          accessor: 'recentAction',
          Cell: AssignmentRecentActionTableCell,
          disableFilters: true,
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
        <AssignmentTableRemindAction />,
        <AssignmentTableCancelAction />,
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
