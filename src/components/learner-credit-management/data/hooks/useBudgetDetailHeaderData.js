import { getBudgetStatus } from '../utils';

const transformSubsidySummaryToPolicy = (subsidySummary, metadata) => {
  if (!subsidySummary) { return null; }

  return {
    displayName: metadata.displayName,
    subsidyActiveDatetime: metadata.startDatetime,
    subsidyExpirationDatetime: metadata.endDatetime,
    aggregates: {
      spendAvailableUsd: subsidySummary.remainingBalance,
      amountAllocatedUsd: 0,
      amountRedeemedUsd: subsidySummary.amountOfOfferSpent,
    },
    spendLimit: subsidySummary.maxDiscount * 100,
    isAssignable: false,
  };
};

const assignBudgetStatus = (policy) => {
  const {
    status, badgeVariant, term, date,
  } = getBudgetStatus(
    policy.subsidyActiveDatetime,
    policy.subsidyExpirationDatetime,
  );

  return {
    status, badgeVariant, term, date,
  };
};

const assignBudgetDetails = (policy) => {
  const { spendAvailableUsd, amountAllocatedUsd, amountRedeemedUsd } = policy.aggregates;

  const available = spendAvailableUsd;
  const limit = policy.spendLimit / 100;
  const utilized = policy.isAssignable
    ? (amountAllocatedUsd + amountRedeemedUsd)
    : amountRedeemedUsd;

  return { budgetTotalSummary: { available, limit, utilized } };
};

const useBudgetDetailHeaderData = ({
  subsidyAccessPolicy, subsidySummary, budgetId, enterpriseOfferMetadata,
}) => {
  const policy = subsidyAccessPolicy || transformSubsidySummaryToPolicy(subsidySummary, enterpriseOfferMetadata);

  if (policy == null) {
    return {};
  }

  const defaultData = {
    budgetId,
    budgetTotalSummary: {
      available: 0,
      utilized: 0,
      limit: 0,
    },
    budgetAggregates: policy.aggregates || {},
    isAssignable: policy.isAssignable || false,
    budgetDisplayName: policy.displayName || 'Overview',
  };

  return {
    ...defaultData,
    ...assignBudgetStatus(policy),
    ...assignBudgetDetails(policy),
  };
};

export default useBudgetDetailHeaderData;
