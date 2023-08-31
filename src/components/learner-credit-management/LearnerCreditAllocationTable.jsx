import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DataTable, Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import TableTextFilter from './TableTextFilter';
import EmailAddressTableCell from './EmailAddressTableCell';
import { getCourseProductLineText } from '../../utils';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

const getEnrollmentDetailsAccessor = row => ({
  courseTitle: row.courseTitle,
  userEmail: row.userEmail,
  courseKey: row.courseKey,
});

const LearnerCreditAllocationTable = ({
  isLoading,
  tableData,
  fetchTableData,
  enterpriseUUID,
  enterpriseSlug,
}) => {
  const defaultFilter = [];

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
      /* eslint-disable */
      columns={[
        {
          Header: 'Date',
          accessor: 'enrollmentDate',
          Cell: ({ row }) => dayjs(row.values.enrollmentDate).format('MMM D, YYYY'),
          disableFilters: true,
        },
        {
          Header: 'Enrollment details',
          accessor: getEnrollmentDetailsAccessor,
          Cell: ({ row }) => (
            <>
              <EmailAddressTableCell row={row} enterpriseUUID={enterpriseUUID} />
              <div>
                <Hyperlink
                  destination={`${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.courseKey}`}
                  target="_blank"
                >
                  {row.original.courseTitle}
                </Hyperlink>
              </div>
            </>
          ),
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
/* eslint-enable */

LearnerCreditAllocationTable.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
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
