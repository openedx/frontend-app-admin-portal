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

  const { data: enterpriseOfferMetadata } = useEnterpriseOffer(enterpriseOfferId);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

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
