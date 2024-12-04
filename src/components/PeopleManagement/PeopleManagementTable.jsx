import React from 'react';
import { CardView, DataTable } from '@openedx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TableTextFilter from '../learner-credit-management/TableTextFilter';
import CustomDataTableEmptyState from '../learner-credit-management/CustomDataTableEmptyState';
import OrgMemberCard from './OrgMemberCard';
import useEnterpriseMembersTableData from './data/hooks/useEnterpriseMembersTableData';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const PeopleManagementTable = ({ enterpriseId }) => {
  const {
    isLoading: isTableLoading,
    enterpriseMembersTableData,
    fetchEnterpriseMembersTableData,
  } = useEnterpriseMembersTableData({ enterpriseId });

  const tableColumns = [{ Header: 'Name', accessor: 'name' }];

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isFilterable
      manualFilters
      isLoading={isTableLoading}
      defaultColumnValues={{ Filter: TableTextFilter }}
      FilterStatusComponent={FilterStatus}
      numBreakoutFilters={2}
      columns={tableColumns}
      initialState={{
        pageSize: 10,
        pageIndex: 0,
        sortBy: [
          { id: 'enterpriseCustomerUser.name', desc: true },
        ],
        filters: [],
      }}
      fetchData={fetchEnterpriseMembersTableData}
      data={enterpriseMembersTableData.results}
      itemCount={enterpriseMembersTableData.itemCount}
      pageCount={enterpriseMembersTableData.pageCount}
      EmptyTableComponent={CustomDataTableEmptyState}
    >
      <DataTable.TableControlBar />
      <CardView
        className="d-block"
        CardComponent={OrgMemberCard}
        columnSizes={{ xs: 12 }}
      />
      <DataTable.TableFooter />
    </DataTable>
  );
};

PeopleManagementTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(PeopleManagementTable);
