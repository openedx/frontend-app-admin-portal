import React from 'react';
import {
  Stack,
} from '@openedx/paragon';

import {
  useBudgetId,
  useSubsidyAccessPolicy,
  useEnterpriseOffer,
} from './data';

import BudgetDetailPageBreadcrumbs from './BudgetDetailPageBreadcrumbs';
import BudgetOverviewContent from './BudgetOverviewContent';
import BudgetExpiryAlertAndModal from '../BudgetExpiryAlertAndModal';

const BudgetDetailPageHeader = () => {
  const { subsidyAccessPolicyId, enterpriseOfferId } = useBudgetId();

  // Fetch enterprise offer with graceful error handling
  const { data: enterpriseOfferMetadata } = useEnterpriseOffer(enterpriseOfferId);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  // Use enterprise offer display name if available, fall back to subsidy access policy, then 'Overview'
  const displayName = subsidyAccessPolicy?.displayName || enterpriseOfferMetadata?.displayName || 'Overview';

  return (
    <Stack gap={2}>
      <BudgetDetailPageBreadcrumbs displayName={displayName} />
      <BudgetExpiryAlertAndModal />
      <BudgetOverviewContent />
    </Stack>
  );
};

export default (BudgetDetailPageHeader);
