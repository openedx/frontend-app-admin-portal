import React from 'react';
import PropTypes from 'prop-types';
import { useOfferSummary } from './data';
import SubBudgetCard from './SubBudgetCard';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

/**
 * Renders one or more budget cards for the given offer (enterprise or Subsidy from enterprise-subsidy). If the offer is
 * an enterprise offer, it will render a single card. If the offer is a Subsidy, it will render one card for
 * each associated budget.
 *
 * @param {*} offer Represents either an enterprise offer or a Subsidy (enterprise-subsidy).
 * @returns Budget card component(s).
 */
const BudgetCard = ({
  offer,
  enterpriseUUID,
  enterpriseSlug,
  offerType,
  displayName,
}) => {
  const { start, end } = offer;

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  // Enterprise Offers will always have a single budget, so we can render a single card.
  if (offerType === BUDGET_TYPES.ecommerce) {
    return (
      <SubBudgetCard
        isLoading={isLoadingOfferSummary}
        id={offerSummary?.offerId}
        start={start}
        end={end}
        available={offerSummary?.remainingFunds}
        spent={offerSummary?.redeemedFunds}
        displayName={displayName}
        enterpriseSlug={enterpriseSlug}
      />
    );
  }

  // We're now dealing with a Subsidy (enterprise-subsidy), but the analytics API isn't aware of any
  // associated budgets; nothing should display.
  if (!offerSummary?.budgetsSummary) {
    return null;
  }

  // Render a card for each associated budget with the Subsidy (enterprise-subsidy)
  return offerSummary.budgetsSummary.map((budget) => (
    <SubBudgetCard
      isLoading={isLoadingOfferSummary}
      key={budget?.subsidyAccessPolicyUuid}
      id={budget?.subsidyAccessPolicyUuid}
      start={start}
      end={end}
      available={budget?.remainingFunds}
      spent={budget?.redeemedFunds}
      displayName={budget?.subsidyAccessPolicyDisplayName}
      enterpriseSlug={enterpriseSlug}
    />
  ));
};

BudgetCard.propTypes = {
  offer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  offerType: PropTypes.oneOf(Object.values(BUDGET_TYPES)).isRequired,
  displayName: PropTypes.string,
};

export default BudgetCard;
