import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DataTable } from '@edx/paragon';
import TableTextFilter from './TableTextFilter';
import SpendTableEmptyState from './SpendTableEmptyState';
import SpendTableEnrollmentDetails from './SpendTableEnrollmentDetails';
import { getCourseProductLineText } from '../../utils';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const LearnerCreditAllocationTable = ({
  isLoading,
  tableData,
  fetchTableData,
}) => {
  const defaultFilter = [];

  return (
    <>
      <h3 className="mb-3">Spent</h3>
      <p className="small mb-4.5">
        Spent activity is driven by completed enrollments. Enrollment data is automatically updated every 12 hours.
        Come back later to view more recent enrollments.
      </p>
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
            Header: 'Date',
            accessor: 'enrollmentDate',
            Cell: ({ row }) => dayjs(row.values.enrollmentDate).format('MMM D, YYYY'),
            disableFilters: true,
          },
          {
            Header: 'Enrollment details',
            Cell: SpendTableEnrollmentDetails,
            disableFilters: false,
            disableSortBy: true,
          },
          {
            Header: 'Amount',
            accessor: 'courseListPrice',
            Cell: ({ row }) => `$${row.values.courseListPrice}`,
            disableFilters: true,
          },
          {
            Header: 'Product',
            accessor: 'courseProductLine',
            Cell: ({ row }) => getCourseProductLineText(row.values.courseProductLine),
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
          filters: defaultFilter,
        }}
        fetchData={fetchTableData}
        data={tableData.results}
        itemCount={tableData.itemCount}
        pageCount={tableData.pageCount}
        EmptyTableComponent={SpendTableEmptyState}
      />
    </>
  );
};

LearnerCreditAllocationTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      userEmail: PropTypes.string,
      courseTitle: PropTypes.string.isRequired,
      courseListPrice: PropTypes.number.isRequired,
      enrollmentDate: PropTypes.string.isRequired,
      courseProductLine: PropTypes.string.isRequired,
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default LearnerCreditAllocationTable;
