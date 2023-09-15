import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Stack,
} from '@edx/paragon';

import { useOfferSummary } from './data/hooks';
import SubBudgetCard from './Budgetcard-V3';

const BudgetCard = ({
  offer,
  enterpriseUUID,
  enterpriseSlug,
  offerType,
}) => {
  const {
    start,
    end,
  } = offer;

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  const formattedStartDate = dayjs(start).format('MMMM D, YYYY');
  const formattedExpirationDate = dayjs(end).format('MMMM D, YYYY');

  return (
    <Stack gap={4}>
      <>
        <h2>Budgets</h2>
        {!isLoadingOfferSummary
          && offerType === 'ecommerceApi'
          ? (
            <SubBudgetCard
              id={offerSummary.offerId}
              start={formattedStartDate}
              end={formattedExpirationDate}
              available={offerSummary?.remainingFunds}
              spent={offerSummary?.redeemedFunds}
              enterpriseSlug={enterpriseSlug}
            />
          )
          : offerSummary?.budgetsSumary.map((budget) => (
            <SubBudgetCard
              key={budget.subsidyAccessPolicyUuid}
              id={budget.subsidyAccessPolicyUuid}
              start={formattedStartDate}
              end={formattedExpirationDate}
              available={budget?.remainingFunds}
              spent={budget?.redeemedFunds}
              enterpriseSlug={enterpriseSlug}
            />
          ))}
      </>
    </Stack>
  );
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
};

export default BudgetCard;
