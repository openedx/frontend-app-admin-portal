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
        Cell: ({ row }) => `-${formatPrice(row.original.contentQuantity / 100, { maximumFractionDigits: 0 })}`,
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
        Cell: AssignmentRowActionTableCell,
        id: 'action',
      },
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
    data={tableData?.results || []}
    itemCount={tableData?.count || 0}
    pageCount={tableData?.numPages || 1}
    EmptyTableComponent={CustomDataTableEmptyState}
    bulkActions={[
      <AssignmentTableRemindAction />,
      <AssignmentTableCancelAction />,
    ]}
  />
);

BudgetAssignmentsTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape().isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default BudgetAssignmentsTable;
