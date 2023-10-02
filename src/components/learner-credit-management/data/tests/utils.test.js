import { transformOfferSummary, getBudgetStatus } from '../utils';
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

  it('should handle when budgetsSummary is provided', () => {
    const offerSummary = {
      maxDiscount: 1000,
      amountOfOfferSpent: 500,
      remainingBalance: 500,
      percentOfOfferSpent: 0.5,
      offerType: 'Site',
      offerId: '123',
      budgets: [
        {
          id: 123,
          start: '2022-01-01',
          end: '2022-01-01',
          available: 200,
          spent: 100,
          enterpriseSlug: 'test-enterprise',
        }],
    };

    expect(transformOfferSummary(offerSummary)).toEqual({
      totalFunds: 1000,
      redeemedFunds: 500,
      remainingFunds: 500,
      percentUtilized: 0.5,
      offerType: 'Site',
      redeemedFundsExecEd: NaN,
      redeemedFundsOcm: NaN,
      offerId: '123',
      budgetsSummary: [{
        id: 123,
        start: '2022-01-01',
        end: '2022-01-01',
        available: 200,
        spent: 100,
        enterpriseSlug: 'test-enterprise',
      }],
    });
  });
});

describe('getBudgetStatus', () => {
  it('should return "upcoming" when the current date is before the start date', () => {
    const startDateStr = '2023-09-30';
    const endDateStr = '2023-10-30';
    const currentDateStr = '2023-09-28';
    const result = getBudgetStatus(startDateStr, endDateStr, new Date(currentDateStr));
    expect(result).toEqual('Upcoming');
  });

  it('should return "active" when the current date is between the start and end dates', () => {
    const startDateStr = '2023-09-01';
    const endDateStr = '2023-09-30';
    const currentDateStr = '2023-09-05';
    const result = getBudgetStatus(startDateStr, endDateStr, new Date(currentDateStr));
    expect(result).toEqual('Active');
  });

  it('should return "expired" when the current date is after the end date', () => {
    const startDateStr = '2023-08-01';
    const endDateStr = '2023-08-31';
    const result = getBudgetStatus(startDateStr, endDateStr);
    expect(result).toEqual('Expired');
  });
});
