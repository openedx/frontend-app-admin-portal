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
const BudgetCard = ({ original }) => {
  const {
    aggregates,
    end,
    enterpriseSlug,
    enterpriseUUID,
    id,
    isAssignable,
    isRetired,
    retiredAt,
    name,
    source,
    start,
  } = original;

  const {
    isLoading: isLoadingSubsidySummaryAnalyticsApi,
    subsidySummary: subsidySummaryAnalyticsApi,
  } = useSubsidySummaryAnalyticsApi(enterpriseUUID, id, source);

  // Subsidy Access Policies will always have a single budget, so we can render a single card
  // without relying on `useSubsidySummaryAnalyticsApi`.
  if (source === BUDGET_TYPES.policy) {
    return (
      <SubBudgetCard
        id={id}
        start={start}
        end={end}
        available={aggregates.available}
        spent={aggregates.spent}
        pending={aggregates.pending}
        displayName={name}
        enterpriseSlug={enterpriseSlug}
        isAssignable={isAssignable}
        isRetired={isRetired}
        retiredAt={retiredAt}
      />
    );
  }

  // Enterprise Offers (ecommerce) will always have a single budget, so we can render a single card.
  if (source === BUDGET_TYPES.ecommerce) {
    return (
      <SubBudgetCard
        id={subsidySummaryAnalyticsApi?.offerId}
        isLoading={isLoadingSubsidySummaryAnalyticsApi}
        start={start}
        end={end}
        available={subsidySummaryAnalyticsApi?.remainingFunds}
        spent={subsidySummaryAnalyticsApi?.redeemedFunds}
        displayName={name}
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
      start={start}
      end={end}
      available={subBudget.remainingFunds}
      spent={subBudget.redeemedFunds}
      displayName={subBudget.subsidyAccessPolicyDisplayName}
      enterpriseSlug={enterpriseSlug}
    />
  ));
};

BudgetCard.propTypes = {
  original: PropTypes.shape({
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
    isRetired: PropTypes.bool,
    retiredAt: PropTypes.string,
    enterpriseUUID: PropTypes.string.isRequired,
    enterpriseSlug: PropTypes.string.isRequired,
  }).isRequired,
};

export default BudgetCard;
