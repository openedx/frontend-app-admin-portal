import React from 'react';
import PropTypes from 'prop-types';
import { DataTable, CheckboxFilter } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import TableTextFilter from './TableTextFilter';
import CustomDataTableEmptyState from './CustomDataTableEmptyState';
import RequestDetailsTableCell from './RequestDetailsTableCell';
import RequestStatusTableCell from './RequestStatusTableCell';
import RequestAmountTableCell from './RequestAmountTableCell';
import RequestRecentActionTableCell from './RequestRecentActionTableCell';
import ApprovedRequestActionsTableCell from './ApprovedRequestActionsTableCell';
import ApprovedRequestsTableRefreshAction from './ApprovedRequestsTableRefreshAction';
import { DEFAULT_PAGE, PAGE_SIZE } from './data';

const FilterStatus = (rest) => (
  <DataTable.FilterStatus showFilteredFields={false} {...rest} />
);

const getRequestStatusDisplayName = (status) => {
  if (status === 'waiting_for_learner') {
    return 'Waiting for learner';
  }

  if (status === 'refunded') {
    return 'Refunded';
  }

  if (status === 'failed_cancellation') {
    return 'Failed cancellation';
  }

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
};

const BudgetDetailApprovedRequestTable = ({
  isLoading,
  tableData,
  fetchTableData,
}) => {
  const intl = useIntl();
  const statusFilterChoices = tableData.requestStatusCounts
    ? tableData.requestStatusCounts
      .filter(({ lastActionStatus }) => {
        const displayName = getRequestStatusDisplayName(lastActionStatus);
        return !!displayName;
      })
      .map(({ lastActionStatus, count }) => ({
        name: getRequestStatusDisplayName(lastActionStatus),
        number: count,
        value: lastActionStatus,
      }))
    : [];

  const approvedRequestsTableData = (() => ({
    tableActions: [
      <ApprovedRequestsTableRefreshAction refresh={fetchTableData} />,
    ],
    additionalColumns: [],
  }))();

  return (
    <DataTable
      isSortable
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
          Header: intl.formatMessage({
            id: 'lcm.budget.detail.page.approved.requests.table.columns.request.details',
            defaultMessage: 'Request details',
            description:
              'Column header for the request details column in the approved requests table',
          }),
          accessor: 'requestDetails',
          Cell: RequestDetailsTableCell,
          disableSortBy: true,
        },
        {
          Header: intl.formatMessage({
            id: 'lcm.budget.detail.page.approved.requests.table.columns.amount',
            defaultMessage: 'Amount',
            description:
              'Column header for the amount column in the approved requests table',
          }),
          accessor: 'amount',
          Cell: RequestAmountTableCell,
          disableFilters: true,
        },
        {
          Header: intl.formatMessage({
            id: 'lcm.budget.detail.page.approved.requests.table.columns.status',
            defaultMessage: 'Status',
            description:
              'Column header for the status column in the approved requests table',
          }),
          accessor: 'lastActionStatus',
          Cell: RequestStatusTableCell,
          Filter: CheckboxFilter,
          filter: 'includesValue',
          filterChoices: statusFilterChoices,
        },
        {
          Header: intl.formatMessage({
            id: 'lcm.budget.detail.page.approved.requests.table.columns.recent.action',
            defaultMessage: 'Recent action',
            description:
              'Column header for the recent action column in the approved requests table',
          }),
          accessor: 'recentAction',
          Cell: RequestRecentActionTableCell,
          disableFilters: true,
        },
        {
          Header: intl.formatMessage({
            id: 'lcm.budget.detail.page.approved.requests.table.columns.actions',
            defaultMessage: 'Actions',
            description:
              'Column header for the actions column in the approved requests table',
          }),
          accessor: 'actions',
          Cell: ApprovedRequestActionsTableCell,
          disableFilters: true,
          disableSortBy: true,
        },
      ]}
      additionalColumns={approvedRequestsTableData.additionalColumns}
      tableActions={approvedRequestsTableData.tableActions}
      initialTableOptions={{
        getRowId: (row) => row?.uuid?.toString(),
      }}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [
          {
            id: 'recentAction',
            desc: true,
          },
        ],
        filters: [],
      }}
      fetchData={fetchTableData}
      data={tableData.results || []}
      itemCount={tableData.count || 0}
      pageCount={tableData.numPages || 1}
      EmptyTableComponent={CustomDataTableEmptyState}
      bulkActions={[]}
    />
  );
};

BudgetDetailApprovedRequestTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape()),
    requestStatusCounts: PropTypes.arrayOf(
      PropTypes.shape({
        requestStatus: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      }),
    ),
    count: PropTypes.number.isRequired,
    numPages: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default BudgetDetailApprovedRequestTable;
