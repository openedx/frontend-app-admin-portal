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

  if (subsidyAccessPolicyId && isSubsidyAccessPolicyError) {
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
