import React from 'react';
import PropTypes from 'prop-types';
import { useOfferSummary } from './data';
import SubBudgetCard from './SubBudgetCard';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

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

  return offerSummary?.budgetsSummary?.map((budget) => (
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
  offerType: PropTypes.string.isRequired,
  displayName: PropTypes.string,
};

export default BudgetCard;
