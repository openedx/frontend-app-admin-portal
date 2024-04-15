import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LearnerCreditGroupMembersTable from './LearnerCreditGroupMembersTable';
import { useEnterpriseGroupMembersTableData, useBudgetId, useSubsidyAccessPolicy } from './data';

const BudgetDetailMembersTabContents = ({ enterpriseUUID, refresh }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const groupId = subsidyAccessPolicy.groupAssociations[0];
  const {
    isLoading,
    enterpriseGroupMembersTableData,
    fetchEnterpriseGroupMembersTableData,
  } = useEnterpriseGroupMembersTableData({
    enterpriseUUID,
    subsidyAccessPolicyId,
    groupId,
    refresh,
  });

  return (
    <>
      <div className="mb-4">
        <h4 className="mt-1">Budget Members</h4>
        <p className="font-weight-light">
          Members choose what to learn from the catalog and spend from the budget to enroll.
        </p>
      </div>
      <LearnerCreditGroupMembersTable
        isLoading={isLoading}
        tableData={enterpriseGroupMembersTableData}
        fetchTableData={fetchEnterpriseGroupMembersTableData}
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetDetailMembersTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailMembersTabContents);
