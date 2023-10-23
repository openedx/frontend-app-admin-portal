import React from 'react';
import { Skeleton, Stack } from '@edx/paragon';

import { useBudgetId, useSubsidyAccessPolicy } from './data';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetDetailPageWrapper from './BudgetDetailPageWrapper';
import BudgetDetailPageHeader from './BudgetDetailPageHeader';

const BudgetDetailPage = () => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const {
    isInitialLoading: isInitialLoadingSubsidyAccessPolicy,
    data: subsidyAccessPolicy,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  if (isInitialLoadingSubsidyAccessPolicy) {
    return (
      <BudgetDetailPageWrapper>
        <Skeleton height={25} />
        <Skeleton height={50} />
        <Skeleton height={360} />
        <Skeleton height={360} />
        <span className="sr-only">loading budget details</span>
      </BudgetDetailPageWrapper>
    );
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
