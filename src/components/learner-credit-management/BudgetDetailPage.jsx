import React from 'react';
import { Skeleton, Stack } from '@edx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useBudgetId, useEnterpriseOffer, useSubsidyAccessPolicy } from './data';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetDetailPageWrapper from './BudgetDetailPageWrapper';
import BudgetDetailPageHeader from './BudgetDetailPageHeader';
import NotFoundPage from '../NotFoundPage';

const BudgetDetailPage = () => {
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
    isInitialLoading: isSubsidyAccessPolicyInitialLoading,
    isError: isSubsidyAccessPolicyError,
    error,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    data: enterpriseOffer,
    isInitialLoading: isEnterpriseOfferInitialLoading,
  } = useEnterpriseOffer(enterpriseOfferId);

  const isLoading = isSubsidyAccessPolicyInitialLoading || isEnterpriseOfferInitialLoading;

  if (isLoading) {
    return (
      <BudgetDetailPageWrapper includeHero={false}>
        <Skeleton height={25} />
        <Skeleton height={50} />
        <Skeleton height={360} />
        <Skeleton height={360} />
        <span className="sr-only">
          <FormattedMessage
            id="lcm.budget.detail.page.loading"
            defaultMessage="loading budget details"
            description="loading budget details"
          />
        </span>
      </BudgetDetailPageWrapper>
    );
  }

  // If the budget is intended to be a subsidy access policy (by presence of a policy UUID),
  // and the subsidy access policy is not found, show 404 messaging.
  if (subsidyAccessPolicyId && isSubsidyAccessPolicyError && error?.customAttributes.httpErrorStatus === 404) {
    return <NotFoundPage />;
  }

  return (
    <BudgetDetailPageWrapper
      subsidyAccessPolicy={subsidyAccessPolicy}
      enterpriseOffer={enterpriseOffer}
    >
      <Stack gap={4}>
        <BudgetDetailPageHeader />
        <BudgetDetailTabsAndRoutes />
      </Stack>
    </BudgetDetailPageWrapper>
  );
};

export default BudgetDetailPage;
