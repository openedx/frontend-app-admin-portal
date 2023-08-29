import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Avatar, DataTable, Hyperlink, useMediaQuery, breakpoints,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import TableTextFilter from './TableTextFilter';
import EmailAddressTableCell from './EmailAddressTableCell';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

const getDescriptionAccessor = row => ({
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
  const isDesktopTable = useMediaQuery({ minWidth: breakpoints.extraLarge.minWidth });
  const defaultFilter = [];

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
          Header: 'Date',
          accessor: 'enrollmentDate',
          // eslint-disable-next-line react/prop-types, react/no-unstable-nested-components
          Cell: ({ row }) => dayjs(row.values.enrollmentDate).format('MMM D, YYYY'),
          disableFilters: true,
        },
        {
          Header: 'Description',
          accessor: getDescriptionAccessor,
          // eslint-disable-next-line react/prop-types, react/no-unstable-nested-components
          Cell: ({ row }) => (
            <>
              <Avatar size="xs" />{' '}
              <EmailAddressTableCell row={row} enterpriseUUID={enterpriseUUID} />
              <div>
                <Hyperlink
                  // eslint-disable-next-line react/prop-types
                  destination={`${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.courseKey}`}
                  target="_blank"
                >
                  {/* eslint-disable-next-line react/prop-types */}
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
          // eslint-disable-next-line react/prop-types
          Cell: ({ row }) => `$${row.values.courseListPrice}`,
          disableFilters: true,
        },
      ]}
      initialTableOptions={{
        // eslint-disable-next-line react/prop-types
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
        // eslint-disable-next-line react/no-unstable-nested-components
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
