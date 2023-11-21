import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';
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

const BudgetAssignmentsTable = ({
  isLoading,
  tableData,
  fetchTableData,
}) => (
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
    FilterStatusComponent={FilterStatus}
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
        Cell: AssignmentStatusTableCell,
        disableFilters: true,
      },
      {
        Header: 'Recent action',
        Cell: AssignmentRecentActionTableCell,
        disableFilters: true,
      },
    ]}
    additionalColumns={[
      {
        Header: '',
        /* eslint-disable react/no-unstable-nested-components */
        /* eslint-disable react/prop-types */
        Cell: ({ row, state }) => (
          <AssignmentRowActionTableCell
            refresh={fetchTableData}
            row={row}
            tableInstance={state}
          />
        ),
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
      sortBy: [],
      filters: [],
    }}
    fetchData={fetchTableData}
    data={tableData?.results.filter(assignment => assignment.state !== 'cancelled') || []}
    itemCount={tableData?.count || 0}
    pageCount={tableData?.numPages || 1}
    EmptyTableComponent={CustomDataTableEmptyState}
    bulkActions={[
      <AssignmentTableRemindAction />,
      <AssignmentTableCancelAction refresh={fetchTableData} />,
    ]}
  />
);

BudgetAssignmentsTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape().isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default BudgetAssignmentsTable;
