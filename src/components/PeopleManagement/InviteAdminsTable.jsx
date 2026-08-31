import React from 'react';
import { CardView, DataTable } from '@openedx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import TableTextFilter from '../learner-credit-management/TableTextFilter';
import CustomDataTableEmptyState from '../learner-credit-management/CustomDataTableEmptyState';
import OrgInviteAdminCard from './OrgInviteAdminCard';
import useEnterpriseAdminsTableData from './data/hooks/useEnterpriseAdminsTableData';

const FilterStatus = (rest) => (
  <DataTable.FilterStatus showFilteredFields={false} {...rest} />
);
const InviteAdminsTable = ({ enterpriseId }) => {
  const {
    isLoading: isTableLoading,
    enterpriseAdminsTableData,
    fetchEnterpriseAdminsTableData,
    // fetchAllEnterpriseAdminsData,
  } = useEnterpriseAdminsTableData({ enterpriseId });

  const tableColumns = [
    { Header: 'admin details', accessor: 'name' },
  ];

  return (
    <>
      {/* ================= Header ================= */}
      <h3 className="mt-3">
        <FormattedMessage
          id="adminPortal.peopleManagement.inviteAdmin.title"
          defaultMessage="Your organization's admins"
          description="Title for people management invite admin data table."
        />
      </h3>
      <p className="mb-2">
        <FormattedMessage
          id="adminPortal.peopleManagement.inviteAdmin.subtitle"
          defaultMessage="View all admins of your organization."
          description="Subtitle for people management admins data table."
        />
      </p>

      {/* ================= Table ================= */}
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
          sortBy: [{ id: 'name', desc: true }],
          filters: [],
        }}
        fetchData={fetchEnterpriseAdminsTableData}
        data={enterpriseAdminsTableData.results}
        itemCount={enterpriseAdminsTableData.itemCount}
        pageCount={enterpriseAdminsTableData.pageCount}
        EmptyTableComponent={CustomDataTableEmptyState}

      >
        <DataTable.TableControlBar />
        <CardView
          className="d-block"
          CardComponent={OrgInviteAdminCard}
          columnSizes={{ xs: 12 }}
        />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

InviteAdminsTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(InviteAdminsTable);
