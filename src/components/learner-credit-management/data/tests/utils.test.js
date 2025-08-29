import { createIntl } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import {
  getAssignableCourseRuns,
  getBudgetStatus,
  getNormalizedStartDate,
  getTranslatedBudgetStatus,
  getTranslatedBudgetTerm,
  orderBudgets,
  startAndEnrollBySortLogic,
  transformSubsidySummary,
  retrieveBudgetDetailActivityOverview,
  transformRequestOverview,
} from '../utils';
import {
  COURSE_PACING_MAP,
  EXEC_ED_OFFER_TYPE,
} from '../constants';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import SubsidyApiService from '../../../../data/services/EnterpriseSubsidyApiService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

jest.mock('../../../../data/services/EnterpriseDataApiService', () => ({
  fetchCourseEnrollments: jest.fn(),
}));
jest.mock('../../../../data/services/EnterpriseSubsidyApiService', () => ({
  fetchCustomerTransactions: jest.fn(),
}));
jest.mock('../../../../data/services/EnterpriseAccessApiService', () => ({
  listContentAssignments: jest.fn(),
  fetchBnrSubsidyRequests: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  camelCaseObject: jest.fn(obj => obj),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logInfo: jest.fn(),
}));

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

describe('getNormalizedStartDate', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    // Self-paced, and start date is more than START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS days before today.
    // Adjust the start date to become today.
    {
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-30T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.SELF_PACED,
      weeksToComplete: 300,
      expectedResult: '2024-01-20T00:00:00.000Z',
    },
    // Self-paced, and there's enough time to complete.
    // Adjust the start date to become today.
    {
      start: '2024-01-15T00:00:00.000Z',
      end: '2024-02-20T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.SELF_PACED,
      weeksToComplete: 3,
      expectedResult: '2024-01-20T00:00:00.000Z',
    },

    //
    // All subsequent test cases should result in NOT adjusting the start date.
    //

    // Course starts more than START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS days before today,
    // BUT the course is instructor paced.
    {
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-02-20T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.INSTRUCTOR_PACED,
      weeksToComplete: 300,
      expectedResult: '2024-01-01T00:00:00.000Z',
    },
    // Course starts in the past, there's enough time to complete,
    // BUT the course is instructor paced.
    {
      start: '2024-01-15T00:00:00.000Z',
      end: '2024-02-20T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.INSTRUCTOR_PACED,
      weeksToComplete: 3,
      expectedResult: '2024-01-15T00:00:00.000Z',
    },
    // Course is Self-paced, BUT there's no time to complete and it started
    // within START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS days ago.
    {
      start: '2024-01-15T00:00:00.000Z',
      end: '2024-01-30T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.SELF_PACED,
      weeksToComplete: 300,
      expectedResult: '2024-01-15T00:00:00.000Z',
    },
    // NEW test case for fixing ENT-10263.
    // Course is Self-paced, there's time to complete, BUT start date is in the future.
    {
      start: '2024-01-25T00:00:00.000Z',
      end: '2024-02-20T00:00:00.000Z',
      today: '2024-01-20T00:00:00.000Z',
      pacingType: COURSE_PACING_MAP.SELF_PACED,
      weeksToComplete: 3,
      expectedResult: '2024-01-25T00:00:00.000Z',
    },
  ])('normalizes start date as expected', ({
    start,
    end,
    today,
    pacingType,
    weeksToComplete,
    expectedResult,
  }) => {
    jest.useFakeTimers({ now: new Date(today) });
    expect(getNormalizedStartDate({
      start, pacingType, end, weeksToComplete,
    })).toEqual(expectedResult);
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

describe('getAssignableCourseRuns', () => {
  it('includes a late, non-restricted course run when late-redemption eligible', () => {
    const courseRuns = [
      {
        key: 'the-course-run',
        enrollBy: dayjs().subtract(1, 'day'),
        hasEnrollBy: true,
        upgradeDeadline: dayjs().add(1, 'day'),
        start: dayjs().subtract(1, 'day'),
        isActive: true,
      },
    ];
    const subsidyExpirationDatetime = dayjs().add(100, 'day');
    const isLateRedemptionAllowed = true;

    const result = getAssignableCourseRuns({ courseRuns, subsidyExpirationDatetime, isLateRedemptionAllowed });
    expect(result.length).toEqual(1);
    expect(result[0].key).toEqual('the-course-run');
  });
  it('returns an empty list given only a restricted run , even when late-redemption eligible', () => {
    const courseRuns = [
      {
        enrollBy: dayjs().subtract(1, 'day'),
        hasEnrollBy: true,
        restrictionType: 'b2b-enterprise',
        upgradeDeadline: dayjs().subtract(1, 'day'),
        start: dayjs().subtract(1, 'day'),
        isActive: true,
      },
    ];
    const subsidyExpirationDatetime = dayjs().add(100, 'day');
    const isLateRedemptionAllowed = true;

    const result = getAssignableCourseRuns({ courseRuns, subsidyExpirationDatetime, isLateRedemptionAllowed });
    expect(result).toEqual([]);
  });
});

const mockSpentTransactions = { results: [{ uuid: '123', amount: 100 }] };
const mockContentAssignments = { results: [{ uuid: 'assignment-123', learnerEmail: 'test@example.com' }] };
const mockBnrRequests = { results: [{ uuid: 'bnr-123', status: 'approved' }] };

describe('retrieveBudgetDetailActivityOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch only spent transactions when top-down assignment is disabled', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue({
      data: mockSpentTransactions,
    });

    const result = await retrieveBudgetDetailActivityOverview({
      budgetId: 'budget-123',
      subsidyAccessPolicy: null,
      enterpriseUUID: 'enterprise-123',
      isTopDownAssignmentEnabled: false,
    });

    expect(result).toEqual({
      spentTransactions: mockSpentTransactions,
    });

    expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
      'enterprise-123',
      expect.objectContaining({
        page: 1,
        pageSize: 25,
        ignoreNullCourseListPrice: true,
      }),
    );
    expect(EnterpriseAccessApiService.listContentAssignments).not.toHaveBeenCalled();
    expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).not.toHaveBeenCalled();
  });

  it('should fetch spent transactions and content assignments when subsidy access policy is assignable', async () => {
    SubsidyApiService.fetchCustomerTransactions.mockResolvedValue({
      data: mockSpentTransactions,
    });
    EnterpriseAccessApiService.listContentAssignments.mockResolvedValue({
      data: mockContentAssignments,
    });

    const result = await retrieveBudgetDetailActivityOverview({
      budgetId: 'budget-123',
      subsidyAccessPolicy: {
        subsidyUuid: 'subsidy-123',
        isAssignable: true,
        assignmentConfiguration: { uuid: 'config-123' },
        bnrEnabled: false,
      },
      enterpriseUUID: 'enterprise-123',
      isTopDownAssignmentEnabled: true,
    });

    expect(result).toEqual({
      spentTransactions: mockSpentTransactions,
      contentAssignments: mockContentAssignments,
    });

    expect(SubsidyApiService.fetchCustomerTransactions).toHaveBeenCalledWith(
      'subsidy-123',
      expect.objectContaining({
        page: 1,
        pageSize: 25,
        subsidyAccessPolicyUuid: 'budget-123',
      }),
    );
    expect(EnterpriseAccessApiService.listContentAssignments).toHaveBeenCalledWith('config-123', {});
    expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).not.toHaveBeenCalled();
  });

  it('should fetch BnR subsidy requests when subsidy access policy has bnrEnabled=true', async () => {
    SubsidyApiService.fetchCustomerTransactions.mockResolvedValue({
      data: mockSpentTransactions,
    });
    EnterpriseAccessApiService.listContentAssignments.mockResolvedValue({
      data: mockContentAssignments,
    });
    EnterpriseAccessApiService.fetchBnrSubsidyRequests.mockResolvedValue({
      data: mockBnrRequests,
    });

    const result = await retrieveBudgetDetailActivityOverview({
      budgetId: 'budget-123',
      subsidyAccessPolicy: {
        subsidyUuid: 'subsidy-123',
        isAssignable: true,
        assignmentConfiguration: { uuid: 'config-123' },
        bnrEnabled: true,
        uuid: 'policy-uuid-123',
      },
      enterpriseUUID: 'enterprise-uuid-123',
      isTopDownAssignmentEnabled: true,
    });

    expect(result).toEqual({
      spentTransactions: mockSpentTransactions,
      contentAssignments: mockContentAssignments,
      approvedBnrRequests: mockBnrRequests,
    });

    expect(SubsidyApiService.fetchCustomerTransactions).toHaveBeenCalledWith(
      'subsidy-123',
      expect.objectContaining({
        page: 1,
        pageSize: 25,
        subsidyAccessPolicyUuid: 'budget-123',
      }),
    );
    expect(EnterpriseAccessApiService.listContentAssignments).toHaveBeenCalledWith('config-123', {});
    expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
      'enterprise-uuid-123',
      'policy-uuid-123',
      expect.objectContaining({
        state: 'approved',
      }),
    );
  });
});

describe('transformRequestOverview', () => {
  it('should transform allowed request states correctly', () => {
    const requestStates = [
      { state: 'requested', count: 10 },
      { state: 'cancelled', count: 5 },
      { state: 'declined', count: 3 },
    ];

    const result = transformRequestOverview(requestStates);

    expect(result).toEqual([
      { name: 'Requested', number: 10, value: 'requested' },
      { name: 'Cancelled', number: 5, value: 'cancelled' },
      { name: 'Declined', number: 3, value: 'declined' },
    ]);
  });

  it('should filter out disallowed request states', () => {
    const requestStates = [
      { state: 'requested', count: 10 },
      { state: 'approved', count: 8 },
      { state: 'cancelled', count: 5 },
      { state: 'pending', count: 12 },
      { state: 'declined', count: 3 },
    ];

    const result = transformRequestOverview(requestStates);

    expect(result).toEqual([
      { name: 'Requested', number: 10, value: 'requested' },
      { name: 'Cancelled', number: 5, value: 'cancelled' },
      { name: 'Declined', number: 3, value: 'declined' },
    ]);
    expect(result).toHaveLength(3);
  });

  it('should handle empty array input', () => {
    const requestStates = [];
    const result = transformRequestOverview(requestStates);
    expect(result).toEqual([]);
  });

  it('should handle array with no allowed states', () => {
    const requestStates = [
      { state: 'approved', count: 8 },
      { state: 'pending', count: 12 },
      { state: 'unknown', count: 2 },
    ];

    const result = transformRequestOverview(requestStates);
    expect(result).toEqual([]);
  });

  it('should handle single allowed state', () => {
    const requestStates = [
      { state: 'requested', count: 15 },
    ];

    const result = transformRequestOverview(requestStates);

    expect(result).toEqual([
      { name: 'Requested', number: 15, value: 'requested' },
    ]);
  });

  it('should handle mixed case and maintain original value', () => {
    const requestStates = [
      { state: 'requested', count: 10 },
      { state: 'cancelled', count: 5 },
      { state: 'declined', count: 3 },
    ];

    const result = transformRequestOverview(requestStates);

    // Verify that the original state value is preserved in the 'value' field
    expect(result[0].value).toBe('requested');
    expect(result[1].value).toBe('cancelled');
    expect(result[2].value).toBe('declined');

    // Verify that the name is properly capitalized
    expect(result[0].name).toBe('Requested');
    expect(result[1].name).toBe('Cancelled');
    expect(result[2].name).toBe('Declined');
  });

  it('should handle zero counts', () => {
    const requestStates = [
      { state: 'requested', count: 0 },
      { state: 'cancelled', count: 0 },
      { state: 'declined', count: 0 },
    ];

    const result = transformRequestOverview(requestStates);

    expect(result).toEqual([
      { name: 'Requested', number: 0, value: 'requested' },
      { name: 'Cancelled', number: 0, value: 'cancelled' },
      { name: 'Declined', number: 0, value: 'declined' },
    ]);
  });
});
