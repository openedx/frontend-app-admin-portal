import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';
import TableTextFilter from './TableTextFilter';
import CustomDataTableEmptyState from './CustomDataTableEmptyState';
import SpendTableEnrollmentDetails from './SpendTableEnrollmentDetails';

import {
  PAGE_SIZE,
  DEFAULT_PAGE,
  formatDate,
} from './data';
import SpendTableAmountContents from './SpendTableAmountContents';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const LearnerCreditAllocationTable = ({
  isLoading,
  tableData,
  fetchTableData,
}) => {
  const intl = useIntl();
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
      FilterStatusComponent={FilterStatus}
      columns={[
        {
          Header:
          intl.formatMessage({
            id: 'lcm.learner.credit.allocation.spent.table.column.Date',
            defaultMessage: 'Date',
            description: 'Column header for the Date column in the Learner Credit Allocation table',
          }),
          accessor: 'enrollmentDate',
          Cell: ({ row }) => formatDate(row.values.enrollmentDate),
          disableFilters: true,
        },
        {
          Header:
          intl.formatMessage({
            id: 'lcm.learner.credit.allocation.spent.table.column.enrollment.details',
            defaultMessage: 'Enrollment details',
            description: 'Column header for the Enrollment details column in the Learner Credit Allocation table',
          }),
          accessor: 'enrollmentDetails',
          Cell: SpendTableEnrollmentDetails,
          disableSortBy: true,
        },
        {
          Header:
          intl.formatMessage({
            id: 'lcm.learner.credit.allocation.spent.table.column.amount',
            defaultMessage: 'Amount',
            description: 'Column header for the Amount column in the Learner Credit Allocation table',
          }),
          accessor: 'courseListPrice',
          Cell: SpendTableAmountContents,
          disableFilters: true,
        },
      ]}
      initialTableOptions={{
        getRowId: row => row?.uuid?.toString(),
      }}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
        filters: [],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
      EmptyTableComponent={CustomDataTableEmptyState}
    />
  );
};

LearnerCreditAllocationTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      userEmail: PropTypes.string,
      courseTitle: PropTypes.string,
      courseListPrice: PropTypes.number.isRequired,
      enrollmentDate: PropTypes.string.isRequired,
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default LearnerCreditAllocationTable;
