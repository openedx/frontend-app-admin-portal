import { getBudgetStatus } from '../utils';

const transformSubsidySummaryToPolicy = (subsidySummary, enterpriseOfferMetadata) => {
  // Check whether Enterprise Offer metadata is still fetching from the ecommerce API
  if (!enterpriseOfferMetadata) {
    return null;
  }

  const transformedData = {
    displayName: enterpriseOfferMetadata.displayName,
    subsidyActiveDatetime: enterpriseOfferMetadata.startDatetime,
    subsidyExpirationDatetime: enterpriseOfferMetadata.endDatetime,
    isAssignable: false,
  };
  if (subsidySummary) {
    transformedData.spendLimit = subsidySummary.totalFunds * 100;
    transformedData.aggregates = {
      spendAvailableUsd: subsidySummary.remainingFunds,
      amountAllocatedUsd: 0,
      amountRedeemedUsd: subsidySummary.redeemedFunds,
    };
  }
  return transformedData;
};

const assignBudgetStatus = (intl, policy) => {
  const {
    status, badgeVariant, term, date,
  } = getBudgetStatus({
    intl,
    startDateStr: policy.subsidyActiveDatetime,
    endDateStr: policy.subsidyExpirationDatetime,
    isBudgetRetired: policy.retired,
    retiredDateStr: policy.retiredAt,
  });

  return {
    status,
    badgeVariant,
    term,
    date,
  };
};

const assignBudgetDetails = (policy, isTopDownAssignmentEnabled) => {
  if (!policy.aggregates) {
    return {};
  }

  const { spendAvailableUsd, amountAllocatedUsd, amountRedeemedUsd } = policy.aggregates;

  const available = spendAvailableUsd;
  const limit = policy.spendLimit / 100;
  const utilized = (policy.isAssignable && isTopDownAssignmentEnabled) || policy.bnrEnabled
    ? (amountAllocatedUsd + amountRedeemedUsd)
    : amountRedeemedUsd;

  return {
    budgetTotalSummary: {
      available,
      limit,
      utilized,
    },
  };
};

const useBudgetDetailHeaderData = ({
  intl,
  subsidyAccessPolicy,
  subsidySummary,
  budgetId,
  enterpriseOfferMetadata,
  isTopDownAssignmentEnabled,
}) => {
  const policy = subsidyAccessPolicy || transformSubsidySummaryToPolicy(subsidySummary, enterpriseOfferMetadata);

  const transformedPolicyData = {
    budgetId,
    budgetTotalSummary: {
      available: 0,
      utilized: 0,
      limit: 0,
    },
    budgetAggregates: policy?.aggregates || {},
    isAssignable: policy?.isAssignable || false,
    budgetDisplayName: policy?.displayName || 'Overview',
    isRetired: policy?.retired || false,
  };

  if (policy) {
    Object.assign(transformedPolicyData, assignBudgetStatus(intl, policy));
    Object.assign(transformedPolicyData, assignBudgetDetails(policy, isTopDownAssignmentEnabled));
  }
  return transformedPolicyData;
};

export default useBudgetDetailHeaderData;
