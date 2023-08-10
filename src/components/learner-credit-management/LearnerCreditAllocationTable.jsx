import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  DataTable, useMediaQuery, breakpoints,
} from '@edx/paragon';

import TableTextFilter from './TableTextFilter';
import EmailAddressTableCell from './EmailAddressTableCell';

export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

const getDescriptionAccessor = row => ({
  courseTitle: row.courseTitle,
  userEmail: row.userEmail,
});

function renderDescriptionCell(enterpriseUUID) {
  return function DescriptionCellRenderer(props) {
    return <DescriptionCell {...props} enterpriseUUID={enterpriseUUID} />;
  };
}

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const LearnerCreditAllocationTable = ({
  isLoading,
  tableData,
  fetchTableData,
  enterpriseUUID,
  budgetType,
}) => {
  const isDesktopTable = useMediaQuery({ minWidth: breakpoints.extraLarge.minWidth });
  const defaultFilter = budgetType ? [{ id: 'courseProductLine', value: budgetType }] : [];

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
      FilterStatusComponent={FilterStatus}
      columns={[
        {
          Header: 'Date',
          accessor: 'enrollmentDate',
          // eslint-disable-next-line react/prop-types, react/no-unstable-nested-components
          Cell: ({ row }) => dayjs(row.values.enrollmentDate).format('MMMM DD, YYYY'),
          disableFilters: true,
        },
        {
          Header: 'Description',
          accessor: getDescriptionAccessor,
          // eslint-disable-next-line react/prop-types, react/no-unstable-nested-components
          Cell: ({ row }) => (
          <>
            <div>{row.original.courseTitle}</div>
            <EmailAddressTableCell row={row} enterpriseUUID={enterpriseUUID} />
          </>),
          disableFilters: true,
        },
        {
          Header: 'Amount',
          accessor: 'courseListPrice',
          Cell: ({ row }) => `$${row.values.courseListPrice}`,
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
LearnerCreditAllocationTable.defaultProps = {
  budgetType: null,
};

LearnerCreditAllocationTable.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
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
  budgetType: PropTypes.string,
};

export default LearnerCreditAllocationTable;
