import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LearnerCreditGroupMembersTable from './LearnerCreditGroupMembersTable';
import {
  useEnterpriseGroupMembersTableData,
  useBudgetId,
  useSubsidyAccessPolicy,
  useEnterpriseRemovedGroupMembers,
} from '../data';

const BudgetDetailMembersTabContents = ({ enterpriseUUID, refresh, setRefresh }) => {
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
    policyUuid: subsidyAccessPolicy.uuid,
    groupId,
    refresh,
  });
  const {
    isRemovedMembersLoading,
    removedGroupMembersCount,
  } = useEnterpriseRemovedGroupMembers({
    policyUuid: subsidyAccessPolicy.uuid,
    groupId,
  });

  return (
    <div>
      {!isRemovedMembersLoading ? (
        <>
          <div className="mb-4">
            <h4 className="mt-1">
              <FormattedMessage
                id="learnerCreditManagement.budgetDetail.membersTab.label"
                defaultMessage="Budget Members"
                description="Label for the Members tab in the Budget Detail page"
              />
            </h4>
            <p className="font-weight-light">
              <FormattedMessage
                id="learnerCreditManagement.budgetDetail.membersTab.description"
                defaultMessage="Members choose what to learn from the catalog and spend from the budget to enroll."
                description="Description for the Members tab in the Budget Detail page"
              />
            </p>
          </div>
          <LearnerCreditGroupMembersTable
            isLoading={isLoading}
            tableData={enterpriseGroupMembersTableData}
            fetchTableData={fetchEnterpriseGroupMembersTableData}
            refresh={refresh}
            setRefresh={setRefresh}
            groupUuid={subsidyAccessPolicy?.groupAssociations[0]}
            removedGroupMembersCount={removedGroupMembersCount}
          />
        </>
      ) : <Skeleton />}
    </div>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetDetailMembersTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailMembersTabContents);
