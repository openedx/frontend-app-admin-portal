import React from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, useMediaQuery, breakpoints,
} from '@edx/paragon';
import moment from 'moment';

import { useLearnerCreditAllocations } from './data/hooks';
import TableTextFilter from './TableTextFilter';
import EmailAddressTableCell from './EmailAddressTableCell';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

const LearnerCreditAllocationTable = ({ enterpriseUUID, offerId }) => {
  const isDesktopTable = useMediaQuery({ minWidth: breakpoints.extraLarge.minWidth });
  const {
    isLoading,
    tableData,
    fetchTableData,
  } = useLearnerCreditAllocations(enterpriseUUID, offerId);

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
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => <EmailAddressTableCell row={row} enterpriseUUID={enterpriseUUID} />,
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
        pageIndex: DEFAULT_PAGE - 1, // `DataTable` uses zero-indexed array
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
      EmptyTableComponent={
        () => {
          if (isLoading) {
            return null;
          }
          return <DataTable.EmptyTable content="No results found" />;
        }
      }
    />
  );
};

LearnerCreditAllocationTable.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  offerId: PropTypes.number.isRequired,
};

export default LearnerCreditAllocationTable;
