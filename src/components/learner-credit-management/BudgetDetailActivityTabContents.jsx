import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack } from '@edx/paragon';

import BudgetDetailRedemptions from './BudgetDetailRedemptions';
import BudgetDetailAssignments from './BudgetDetailAssignments';
import {
  useOfferRedemptions,
  useBudgetContentAssignments,
  useBudgetId,
  useSubsidyAccessPolicy,
} from './data';

const BudgetDetailActivityTabContents = ({
  enterpriseUUID,
  enterpriseFeatures,
}) => {
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const isTopDownAssignmentEnabled = enterpriseFeatures?.topDownAssignmentRealTimeLcm;

  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, enterpriseOfferId, subsidyAccessPolicyId);

  const {
    isLoading: isLoadingContentAssignments,
    contentAssignments,
    fetchContentAssignments,
  } = useBudgetContentAssignments({
    assignmentConfigurationUUID: subsidyAccessPolicy?.assignmentConfiguration?.uuid,
    isEnabled: subsidyAccessPolicy?.isAssignable && isTopDownAssignmentEnabled,
  });

  return (
    <Stack gap={5}>
      <BudgetDetailAssignments
        isEnabled={!!subsidyAccessPolicy?.isAssignable && isTopDownAssignmentEnabled}
        isLoading={isLoadingContentAssignments}
        tableData={contentAssignments}
        fetchTableData={fetchContentAssignments}
      />
      <BudgetDetailRedemptions
        isLoading={isLoadingOfferRedemptions}
        offerRedemptions={offerRedemptions}
        fetchOfferRedemptions={fetchOfferRedemptions}
      />
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailActivityTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }),
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
