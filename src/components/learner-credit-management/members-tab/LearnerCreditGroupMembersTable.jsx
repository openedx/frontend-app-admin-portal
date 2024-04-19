import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@edx/paragon';
import TableTextFilter from '../TableTextFilter';
import CustomDataTableEmptyState from '../CustomDataTableEmptyState';
import MemberDetailsTableCell from './MemberDetailsTableCell';
import MemberStatusTableCell from './MemberStatusTableCell';
import MemberStatusTableColumnHeader from './MemberStatusTableColumnHeader';
import MemberEnrollmentsTableColumnHeader from './MemberEnrollmentsTableColumnHeader';
import MembersRemoveAction from './bulk-actions/MemberRemoveAction';
import { DEFAULT_PAGE, MEMBERS_TABLE_PAGE_SIZE } from '../data';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const LearnerCreditGroupMembersTable = ({
  isLoading,
  tableData,
  fetchTableData,
  setRefresh,
  groupUuid,
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
        Header: 'Member Details',
        accessor: 'memberDetails',
        Cell: MemberDetailsTableCell,
      },
      {
        Header: MemberStatusTableColumnHeader,
        accessor: 'status',
        Cell: MemberStatusTableCell,
        disableFilters: true,
      },
      {
        Header: 'Recent action',
        accessor: 'recentAction',
        Cell: ({ row }) => row.original.recentAction,
        disableFilters: true,
      },
      {
        Header: MemberEnrollmentsTableColumnHeader,
        accessor: 'memberEnrollment',
        // TODO:
        Cell: () => ('0'),
        disableFilters: true,
      },
    ]}
    initialTableOptions={{
      getRowId: row => row?.memberDetails.userEmail,
    }}
    initialState={{
      pageSize: MEMBERS_TABLE_PAGE_SIZE,
      pageIndex: DEFAULT_PAGE,
      sortBy: [
        { id: 'memberDetails', desc: true },
      ],
      filters: [],
    }}
    bulkActions={[
      <MembersRemoveAction
        setRefresh={setRefresh}
        groupUuid={groupUuid}
      />,
    ]}
    fetchData={fetchTableData}
    data={tableData.results}
    itemCount={tableData.itemCount}
    pageCount={tableData.pageCount}
    EmptyTableComponent={CustomDataTableEmptyState}
  />
);

LearnerCreditGroupMembersTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchTableData: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
};

export default LearnerCreditGroupMembersTable;
