import { createIntl } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import {
  getBudgetStatus,
  getTranslatedBudgetStatus,
  getTranslatedBudgetTerm,
  orderBudgets,
  startAndEnrollBySortLogic,
  transformSubsidySummary,
} from '../utils';
import { EXEC_ED_OFFER_TYPE } from '../constants';

const intl = createIntl({
  locale: 'en',
  messages: {},
});
describe('transformSubsidySummary', () => {
  it('should return null if there is no budgetSummary', () => {
    expect(transformSubsidySummary()).toBeNull();
  });

  it('should safeguard against bad data', () => {
    const budgetSummary = {
      maxDiscount: 1,
      amountOfOfferSpent: 1.34,
      remainingBalance: -0.34,
      percentOfOfferSpent: 1.34,
      offerType: EXEC_ED_OFFER_TYPE,
    };

    expect(transformSubsidySummary(budgetSummary)).toEqual({
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
    const budgetSummary = {
      maxDiscount: null,
      amountOfOfferSpent: 100,
      remainingBalance: null,
      percentOfOfferSpent: null,
      offerType: 'Site',
      offerId: '123',
      budgetsSummary: [],
    };

    expect(transformSubsidySummary(budgetSummary)).toEqual({
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
    const budgetSummary = {
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

    expect(transformSubsidySummary(budgetSummary)).toEqual({
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
  it('should return "Scheduled" when the current date is before the start date', () => {
    const startDateStr = '2024-09-30';
    const endDateStr = '2027-10-30';
    const currentDateStr = '2023-09-28';
    const result = getBudgetStatus({
      startDateStr,
      endDateStr,
      currentDate: new Date(currentDateStr),
    });
    expect(result.status).toEqual('Scheduled');
  });

  it('should return "Active" when the current date is between the start and end dates', () => {
    const startDateStr = '2023-08-01';
    const endDateStr = '2027-10-30';
    const currentDateStr = '2023-09-28';
    const result = getBudgetStatus({
      startDateStr,
      endDateStr,
      currentDate: new Date(currentDateStr),
    });
    expect(result.status).toEqual('Active');
  });

  it('should return "Expired" when the current date is after the end date', () => {
    const startDateStr = '2023-08-01';
    const endDateStr = '2023-08-31';
    const currentDateStr = '2023-09-28';
    const result = getBudgetStatus({
      intl,
      startDateStr,
      endDateStr,
      currentDate: new Date(currentDateStr),
    });
    expect(result.status).toEqual('Expired');
  });

  it('should return "Retired" when `isBudgetRetired=true`', () => {
    const startDateStr = '2023-08-01';
    const endDateStr = '2023-08-31';
    const currentDateStr = '2023-09-28';
    const result = getBudgetStatus({
      startDateStr,
      endDateStr,
      currentDate: new Date(currentDateStr),
      isBudgetRetired: true,
    });
    expect(result.status).toEqual('Retired');
  });
});

// Example Budget objects for testing
const budgets = [
  {
    name: 'Budget 1',
    start: '2023-01-01T00:00:00Z',
    end: '2023-01-10T00:00:00Z',
  },
  {
    name: 'Budget 2',
    start: '2022-12-01T00:00:00Z',
    end: '2022-12-20T00:00:00Z',
  },
  {
    name: 'Budget 3',
    start: '2023-01-01T00:00:00Z',
    end: '2023-01-10T00:00:00Z',
    isRetired: true,
  },
  {
    name: 'Budget 4',
    start: '2023-02-01T00:00:00Z',
    end: '2023-02-15T00:00:00Z',
  },
  {
    name: 'Budget 5',
    start: '2023-01-15T00:00:00Z',
    end: '2023-01-25T00:00:00Z',
  },
];

describe('orderBudgets', () => {
  it('should sort offers correctly', () => {
    const sortedBudgets = orderBudgets(intl, budgets);

    // Expected order:
    // Active budgets (Budget 2)
    // Upcoming budgets (Budget 1, Budget 5)
    // Expired budgets (Budget 4)
    // Retired budgets (Budget 3)
    expect(sortedBudgets.map((budget) => budget.name)).toEqual(['Budget 2', 'Budget 1', 'Budget 5', 'Budget 4', 'Budget 3']);
  });

  it('should handle empty input', () => {
    const sortedBudgets = orderBudgets(intl, []);
    expect(sortedBudgets).toEqual([]);
  });

  it('should handle offers with the same status and end date', () => {
    const duplicateBudgets = [
      { name: 'Budget A', start: '2023-01-01T00:00:00Z', end: '2023-01-15T00:00:00Z' },
      { name: 'Budget B', start: '2023-01-01T00:00:00Z', end: '2023-01-15T00:00:00Z' },
    ];

    const sortedBudgets = orderBudgets(intl, duplicateBudgets);

    // Since both offers have the same status ("active") and end date, they should be sorted alphabetically by name.
    expect(sortedBudgets.map((budget) => budget.name)).toEqual(['Budget A', 'Budget B']);
  });
});

describe('getTranslatedBudgetStatus', () => {
  it('should translate the budget status correctly', () => {
    const mockintl = { formatMessage: jest.fn() };
    const status = 'Retired';

    getTranslatedBudgetStatus(mockintl, status);

    expect(mockintl.formatMessage).toHaveBeenCalledWith({
      id: 'lcm.budgets.budget.card.status.retired',
      defaultMessage: 'Retired',
      description: 'Status for a retired budget',
    });
  });
  it('should handle the case for an unknown value', () => {
    const mockintl = { formatMessage: jest.fn() };
    const status = 'unknown';

    expect(getTranslatedBudgetStatus(mockintl, status)).toEqual('');
  });
});

describe('getTranslatedBudgetTerm', () => {
  it('should translate the budget term correctly', () => {
    const mockintl = { formatMessage: jest.fn() };
    const term = 'Expiring';

    getTranslatedBudgetTerm(mockintl, term);

    expect(mockintl.formatMessage).toHaveBeenCalledWith({
      id: 'lcm.budgets.budget.card.term.expiring',
      defaultMessage: 'Expiring',
      description: 'Term for when a budget is expiring',
    });
  });
  it('should handle the case when unknown or null term', () => {
    const mockintl = { formatMessage: jest.fn() };
    const term1 = 'unknown';
    const term2 = null;

    expect(getTranslatedBudgetTerm(mockintl, term1)).toEqual('');
    expect(getTranslatedBudgetTerm(mockintl, term2)).toEqual('');
  });
});

describe('startAndEnrollBySortLogic', () => {
  it.each([
    // Unique start and enroll-by dates
    {
      sampleData: [
        {
          enrollBy: dayjs().add(1, 'day').toISOString(),
          start: dayjs().add(3, 'day').toISOString(),
          expectedOrder: 2,
        },
        {
          enrollBy: dayjs().subtract(2, 'day').toISOString(),
          start: dayjs().add(1, 'day').toISOString(),
          expectedOrder: 1,
        },
        {
          enrollBy: dayjs().subtract(6, 'day').toISOString(),
          start: dayjs().add(12, 'day').toISOString(),
          expectedOrder: 4,
        },
        {
          enrollBy: dayjs().add(3, 'day').toISOString(),
          start: dayjs().add(5, 'day').toISOString(),
          expectedOrder: 3,
        },
      ],
    },
    // unique start, same enroll by dates
    {
      sampleData: [
        {
          enrollBy: dayjs().add(1, 'day').toISOString(),
          start: dayjs().add(3, 'day').toISOString(),
          expectedOrder: 2,
        },
        {
          enrollBy: dayjs().subtract(1, 'day').toISOString(),
          start: dayjs().add(1, 'day').toISOString(),
          expectedOrder: 1,
        },
        {
          enrollBy: dayjs().subtract(6, 'day').toISOString(),
          start: dayjs().add(12, 'day').toISOString(),
          expectedOrder: 4,
        },
        {
          enrollBy: dayjs().add(6, 'day').toISOString(),
          start: dayjs().add(5, 'day').toISOString(),
          expectedOrder: 3,
        },
      ],
    },
    // unique enroll-by, same start dates
    {
      sampleData: [
        {
          enrollBy: dayjs().add(1, 'day').toISOString(),
          start: dayjs().add(1, 'day').toISOString(),
          expectedOrder: 1,
        },
        {
          enrollBy: dayjs().subtract(2, 'day').toISOString(),
          start: dayjs().add(1, 'day').toISOString(),
          expectedOrder: 2,
        },
        {
          enrollBy: dayjs().subtract(6, 'day').toISOString(),
          start: dayjs().add(12, 'day').toISOString(),
          expectedOrder: 4,
        },
        {
          enrollBy: dayjs().add(3, 'day').toISOString(),
          start: dayjs().add(12, 'day').toISOString(),
          expectedOrder: 3,
        },
      ],
    },
  ])('sorts start date and enroll by date as expected', ({ sampleData }) => {
    const sortedDates = sampleData.sort(startAndEnrollBySortLogic);
    expect(sortedDates).toEqual(sampleData.sort((a, b) => a.expectedOrder - b.expectedOrder));
  });
});
