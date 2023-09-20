import { transformOfferSummary } from '../utils';
import { EXEC_ED_OFFER_TYPE } from '../constants';

describe('transformOfferSummary', () => {
  it('should return null if there is no offerSummary', () => {
    expect(transformOfferSummary()).toBeNull();
  });

  it('should safeguard against bad data', () => {
    const offerSummary = {
      maxDiscount: 1,
      amountOfOfferSpent: 1.34,
      remainingBalance: -0.34,
      percentOfOfferSpent: 1.34,
      offerType: EXEC_ED_OFFER_TYPE,
    };

    expect(transformOfferSummary(offerSummary)).toEqual({
      totalFunds: 1,
      redeemedFunds: 1,
      redeemedFundsExecEd: NaN,
      redeemedFundsOcm: NaN,
      remainingFunds: 0.0,
      percentUtilized: 1.0,
      offerType: EXEC_ED_OFFER_TYPE,
      budgetsSummary: [],
      offerId: undefined,
    });
  });

  it('should handle when no maxDiscount is not set', () => {
    const offerSummary = {
      maxDiscount: null,
      amountOfOfferSpent: 100,
      remainingBalance: null,
      percentOfOfferSpent: null,
      offerType: 'Site',
      offerId: '123',
      budgetsSummary: [],
    };

    expect(transformOfferSummary(offerSummary)).toEqual({
      totalFunds: null,
      redeemedFunds: 100,
      remainingFunds: null,
      percentUtilized: null,
      offerType: 'Site',
      redeemedFundsExecEd: undefined,
      redeemedFundsOcm: undefined,
      offerId: '123',
      budgetsSummary: [],
    });
  });
});
