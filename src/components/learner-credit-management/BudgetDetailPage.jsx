import React from 'react';
import { Skeleton, Stack } from '@edx/paragon';

import { useBudgetId, useSubsidyAccessPolicy } from './data';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetDetailPageWrapper from './BudgetDetailPageWrapper';
import BudgetDetailPageHeader from './BudgetDetailPageHeader';
import NotFoundPage from '../NotFoundPage';

const BudgetDetailPage = () => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
    isInitialLoading: isSubsidyAccessPolicyInitialLoading,
    isError: isSubsidyAccessPolicyError,
    error,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  if (isSubsidyAccessPolicyInitialLoading) {
    return (
      <BudgetDetailPageWrapper includeHero={false}>
        <Skeleton height={25} />
        <Skeleton height={50} />
        <Skeleton height={360} />
        <Skeleton height={360} />
        <span className="sr-only">loading budget details</span>
      </BudgetDetailPageWrapper>
    );
  }

  // If the budget is intended to be a subsidy access policy (by presence of a policy UUID),
  // and the subsidy access policy is not found, show 404 messaging.
  if (subsidyAccessPolicyId && isSubsidyAccessPolicyError && error?.customAttributes.httpErrorStatus === 404) {
    return <NotFoundPage />;
  }

  return (
    <BudgetDetailPageWrapper subsidyAccessPolicy={subsidyAccessPolicy}>
      <Stack gap={4}>
        <BudgetDetailPageHeader />
        <BudgetDetailTabsAndRoutes />
      </Stack>
    </BudgetDetailPageWrapper>
  );
};

export default BudgetDetailPage;
