import React from 'react';
import PropTypes from 'prop-types';
import { useSubsidySummaryAnalyticsApi } from './data';
import SubBudgetCard from './SubBudgetCard';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

/**
 * Renders one or more budget cards for the given budget. If the budget is
 * an enterprise offer, it will render a single card. If the budget is a Subsidy,
 * it will render one card for each associated budget. If the budget is a Policy,
 * it will also render a single card.
 *
 * @param {Object} budget Represents either:
 *  - Enterprise Offer (ecommerce)
 *  - Subsidy (enterprise-subsidy)
 *  - Policy (enterprise-access)
 *
 * @returns Budget card component(s).
 */
const BudgetCard = ({
  budget,
  enterpriseUUID,
  enterpriseSlug,
}) => {
  const {
    isLoading: isLoadingSubsidySummaryAnalyticsApi,
    subsidySummary: subsidySummaryAnalyticsApi,
  } = useSubsidySummaryAnalyticsApi(enterpriseUUID, budget.id, budget.source);

  // Subsidy Access Policies will always have a single budget, so we can render a single card
  // without relying on `useSubsidySummaryAnalyticsApi`.
  if (budget.source === BUDGET_TYPES.policy) {
    return (
      <SubBudgetCard
        id={budget.id}
        start={budget.start}
        end={budget.end}
        available={budget.aggregates.available}
        spent={budget.aggregates.spent}
        pending={budget.aggregates.pending}
        displayName={budget.name}
        enterpriseSlug={enterpriseSlug}
        isAssignable={budget.isAssignable}
      />
    );
  }

  // Enterprise Offers (ecommerce) will always have a single budget, so we can render a single card.
  if (budget.source === BUDGET_TYPES.ecommerce) {
    return (
      <SubBudgetCard
        isLoading={isLoadingSubsidySummaryAnalyticsApi}
        id={subsidySummaryAnalyticsApi?.offerId}
        start={budget.start}
        end={budget.end}
        available={subsidySummaryAnalyticsApi?.remainingFunds}
        spent={subsidySummaryAnalyticsApi?.redeemedFunds}
        displayName={budget.name}
        enterpriseSlug={enterpriseSlug}
      />
    );
  }

  // We're now dealing with a Subsidy (enterprise-subsidy), but the analytics API isn't aware of any
  // associated budgets; nothing should display.
  if (!subsidySummaryAnalyticsApi?.budgetsSummary) {
    return null;
  }

  // Render a card for each associated Budget (Policy, enterprise-access) with the Subsidy (enterprise-subsidy)
  return subsidySummaryAnalyticsApi.budgetsSummary.map((subBudget) => (
    <SubBudgetCard
      isLoading={isLoadingSubsidySummaryAnalyticsApi}
      key={subBudget.subsidyAccessPolicyUuid}
      id={subBudget.subsidyAccessPolicyUuid}
      start={budget.start}
      end={budget.end}
      available={subBudget.remainingFunds}
      spent={subBudget.redeemedFunds}
      displayName={subBudget.subsidyAccessPolicyDisplayName}
      enterpriseSlug={enterpriseSlug}
    />
  ));
};

BudgetCard.propTypes = {
  budget: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    source: PropTypes.oneOf(Object.values(BUDGET_TYPES)).isRequired,
    aggregates: PropTypes.shape({
      available: PropTypes.number.isRequired,
      spent: PropTypes.number.isRequired,
      pending: PropTypes.number,
    }),
    isAssignable: PropTypes.bool,
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default BudgetCard;
