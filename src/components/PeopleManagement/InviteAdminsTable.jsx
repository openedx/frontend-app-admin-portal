import React, { useState, useCallback } from 'react';
import { CardView, DataTable, Toast } from '@openedx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import TableTextFilter from '../learner-credit-management/TableTextFilter';
import CustomDataTableEmptyState from '../learner-credit-management/CustomDataTableEmptyState';
import OrgInviteAdminCard from './OrgInviteAdminCard';
import useEnterpriseAdminsTableData from './data/hooks/useEnterpriseAdminsTableData';
import LmsApiService from '../../data/services/LmsApiService';
import DownloadAdminsCsvIconButton from './DownloadAdminsCsvIconButton';

const FilterStatus = (rest) => (
  <DataTable.FilterStatus showFilteredFields={false} {...rest} />
);
const InviteAdminsTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const {
    isLoading: isTableLoading,
    enterpriseAdminsTableData,
    fetchEnterpriseAdminsTableData,
    fetchAllEnterpriseAdminsData,
  } = useEnterpriseAdminsTableData({ enterpriseId });

  const [isRemovingAdmin, setIsRemovingAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRemoveAdmin = useCallback(async (admin) => {
    try {
      setIsRemovingAdmin(true);
      await LmsApiService.removeEnterpriseAdmin(enterpriseId, admin.id, { role: admin.status });

      setShowToast(true);

      // Refresh the table data after successful removal
      fetchEnterpriseAdminsTableData({
        pageIndex: 0,
        pageSize: 10,
        filters: [],
        sortBy: [{ id: 'name', desc: true }],
      });
    } catch (error) {
      logError(error);
    } finally {
      setIsRemovingAdmin(false);
    }
  }, [enterpriseId, fetchEnterpriseAdminsTableData]);

  const CardComponentWithProps = useCallback((props) => (
    <OrgInviteAdminCard
      {...props}
      onRemoveAdmin={handleRemoveAdmin}
    />
  ), [handleRemoveAdmin]);

  const tableColumns = [
    { Header: 'admin details', accessor: 'name' },
  ];

  return (
    <>
      {/* ================= Header ================= */}
      <div className="d-flex justify-content-between align-items-start mt-3 mb-2">
        <div>
          <h3>
            <FormattedMessage
              id="adminPortal.peopleManagement.inviteAdmin.title"
              defaultMessage="Your organization's admins"
              description="Title for people management invite admin data table."
            />
          </h3>
          <p>
            <FormattedMessage
              id="adminPortal.peopleManagement.inviteAdmin.subtitle"
              defaultMessage="View all admins of your organization."
              description="Subtitle for people management admins data table."
            />
          </p>
        </div>
        <DownloadAdminsCsvIconButton
          fetchData={fetchAllEnterpriseAdminsData}
          dataCount={enterpriseAdminsTableData.itemCount}
        />
      </div>

      {/* ================= Table ================= */}
      <DataTable
        isSortable
        manualSortBy
        isPaginated
        manualPagination
        isFilterable
        manualFilters
        isLoading={isTableLoading || isRemovingAdmin}
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
          CardComponent={CardComponentWithProps}
          columnSizes={{ xs: 12 }}
        />
        <DataTable.TableFooter />
      </DataTable>
      {/* ================= Toast ================= */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
      >
        {intl.formatMessage({
          id: 'adminPortal.peopleManagement.inviteAdmin.removeSuccess',
          defaultMessage: 'Admin removed',
          description: 'Success message when admin is removed',
        })}
      </Toast>
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
