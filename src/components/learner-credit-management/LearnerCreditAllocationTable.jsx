import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, useMediaQuery, breakpoints,
} from '@edx/paragon';
import moment from 'moment';

import TableTextFilter from './TableTextFilter';
import EmailAddressTableCell from './EmailAddressTableCell';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

function LearnerCreditAllocationTable({
  isLoading,
  tableData,
  fetchTableData,
  enterpriseUUID,
}) {
  const isDesktopTable = useMediaQuery({ minWidth: breakpoints.extraLarge.minWidth });

  const getEmailAddressTableCell = (row) => (
    <EmailAddressTableCell row={row} enterpriseUUID={enterpriseUUID} />
  );

  const getEmptyTableComponent = () => {
    if (isLoading) {
      return null;
    }
    return <DataTable.EmptyTable content="No results found" />;
  };

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isFilterable
      manualFilters
      showFiltersInSidebar={isDesktopTable}
      isLoading={isLoading}
      defaultColumnValues={{ Filter: TableTextFilter }}
      columns={[
        {
          Header: 'Email Address',
          accessor: 'userEmail',
          Cell: ({ row }) => getEmailAddressTableCell(row),
        },
        {
          Header: 'Course Name',
          accessor: 'courseTitle',
        },
        {
          Header: 'Course Price',
          accessor: 'courseListPrice',
          Cell: ({ row }) => `$${row.values.courseListPrice}`,
          disableFilters: true,
        },
        {
          Header: 'Date Spent',
          accessor: 'enrollmentDate',
          Cell: ({ row }) => moment(row.values.enrollmentDate).format('MMMM DD, YYYY'),
          disableFilters: true,
        },
      ]}
      initialTableOptions={{
        getRowId: row => row.enterpriseEnrollmentId.toString(),
      }}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
      EmptyTableComponent={getEmptyTableComponent}
    />
  );
}

LearnerCreditAllocationTable.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      userEmail: PropTypes.string.isRequired,
      courseTitle: PropTypes.string.isRequired,
      courseListPrice: PropTypes.number.isRequired,
      enrollmentDate: PropTypes.string.isRequired,
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default LearnerCreditAllocationTable;
