import React from 'react';
import PropTypes from 'prop-types';
import { useBudgetSummaryAnalyticsApi } from './data';
import SubBudgetCard from './SubBudgetCard';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

/**
 * Renders one or more budget cards for the given budget. If the budget is
 * an enterprise offer, it will render a single card. If the budget is a Subsidy,
 * it will render one card for each associated budget. If the budget is a Policy,
 * it will also render a single card.
 *
 * @param {*} budget Represents either:
 *  - Enterprise Offer
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
    isLoading: isLoadingBudgetSummaryAnalyticsApi,
    budgetSummaryAnalyticsApi,
  } = useBudgetSummaryAnalyticsApi(enterpriseUUID, budget);

  // Subsidy Access Policies will always a single budget, so we can render a single card
  // without relying on `useBudgetSummaryAnalyticsApi`.
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
      />
    );
  }

  // Enterprise Offers will always have a single budget, so we can render a single card.
  if (budget.source === BUDGET_TYPES.ecommerce) {
    return (
      <SubBudgetCard
        isLoading={isLoadingBudgetSummaryAnalyticsApi}
        id={budgetSummaryAnalyticsApi?.offerId}
        start={budget.start}
        end={budget.end}
        available={budgetSummaryAnalyticsApi?.remainingFunds}
        spent={budgetSummaryAnalyticsApi?.redeemedFunds}
        displayName={budget.name}
        enterpriseSlug={enterpriseSlug}
      />
    );
  }

  // We're now dealing with a Subsidy (enterprise-subsidy), but the analytics API isn't aware of any
  // associated budgets; nothing should display.
  if (!budgetSummaryAnalyticsApi?.budgetsSummary) {
    return null;
  }

  // Render a card for each associated budget with the Subsidy (enterprise-subsidy)
  return budgetSummaryAnalyticsApi.budgetsSummary.map((subBudget) => (
    <SubBudgetCard
      isLoading={budgetSummaryAnalyticsApi}
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
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    source: PropTypes.oneOf(Object.values(BUDGET_TYPES)).isRequired,
    aggregates: PropTypes.shape({
      available: PropTypes.number.isRequired,
      spent: PropTypes.number.isRequired,
      pending: PropTypes.number,
    }),
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default BudgetCard;
