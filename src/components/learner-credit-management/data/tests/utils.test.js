import { transformOfferSummary } from '../utils';

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
    };

    expect(transformOfferSummary(offerSummary)).toEqual({
      totalFunds: 1,
      redeemedFunds: 1,
      remainingFunds: 0.0,
      percentUtilized: 1.0,
    });
  });

  it('should handle when no maxDiscount is not set', () => {
    const offerSummary = {
      maxDiscount: null,
      amountOfOfferSpent: 100,
      remainingBalance: null,
      percentOfOfferSpent: null,
    };

    expect(transformOfferSummary(offerSummary)).toEqual({
      totalFunds: null,
      redeemedFunds: 100,
      remainingFunds: null,
      percentUtilized: null,
    });
  });
});
