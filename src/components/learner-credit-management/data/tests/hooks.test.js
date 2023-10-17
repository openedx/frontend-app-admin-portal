import { act, renderHook } from '@testing-library/react-hooks/dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import {
  useOfferSummary,
  useOfferRedemptions,
  useOffersBudgets,
} from '../hooks';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_OFFER_ID = 1;
const TEST_ENTERPRISE_SUBSIDY_UUID_1 = 'test-enterprise-subsidy-uuid-1';
const TEST_ENTERPRISE_SUBSIDY_UUID_2 = 'test-enterprise-subsidy-uuid-2';

const mockOfferSummary = {
  offer_id: TEST_ENTERPRISE_OFFER_ID,
  status: 'Open',
  enterprise_customer_uuid: TEST_ENTERPRISE_UUID,
  amount_of_offer_spent: 200.00,
  max_discount: 5000.00,
  percent_of_offer_spent: 0.04,
  remaining_balance: 4800.00,
};
const mockallBudgetsData = {
  offer_id: TEST_ENTERPRISE_OFFER_ID,
  budgets: [
    {
      subsidy_access_policy_uuid: TEST_ENTERPRISE_SUBSIDY_UUID_1,
      subsidy_access_policy_display_name: 'Demo offer 1',
      starting_balance: 1000,
      amount_of_policy_spent: 500,
      remaining_balance: 500,
      percent_of_policy_spent: 0.50,
    },
    {
      subsidy_access_policy_uuid: TEST_ENTERPRISE_SUBSIDY_UUID_2,
      subsidy_access_policy_display_name: 'Demo offer 2',
      starting_balance: 1000,
      amount_of_policy_spent: 500,
      remaining_balance: 500,
      percent_of_policy_spent: 0.50,
    },
  ],
};

const mockEnterpriseOffer = [{
  id: TEST_ENTERPRISE_OFFER_ID,
  start: 'Jan 03, 2023',
  end: 'Jan 03, 2024',
}];
const mockOfferEnrollments = [{
  user_email: 'edx@example.com',
  course_title: 'Test Course Title',
  course_list_price: '100.00',
  enrollment_date: '2022-01-01',
}];

const mockOfferEnrollmentsResponse = {
  count: 100,
  current_page: 1,
  num_pages: 5,
  results: mockOfferEnrollments,
};

describe('useOffersBudgets', () => {
  it('should handle null enterprise offer', async () => {
    const { result } = renderHook(() => useOffersBudgets(TEST_ENTERPRISE_UUID));
    expect(result.current).toEqual({
      allBudgets: [],
      isLoading: false,
    });
  });

  it('should fetch all budgets of all enterprise offers', async () => {
    EnterpriseDataApiService.fetchEnterpriseOfferSummary.mockResolvedValueOnce({ data: mockallBudgetsData });
    const { result, waitForNextUpdate } = renderHook(() => useOffersBudgets(TEST_ENTERPRISE_UUID, mockEnterpriseOffer));

    expect(result.current).toEqual({
      allBudgets: [],
      isLoading: true,
    });

    await waitForNextUpdate(); // You can adjust the timeout value as needed

    expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).toHaveBeenCalled();
    const expectedResult = [
      {
        start: 'Jan 03, 2023',
        end: 'Jan 03, 2024',
        id: TEST_ENTERPRISE_SUBSIDY_UUID_1,
        redeemedFunds: 500,
        remainingFunds: 500,
        totalFunds: 1000,
        percentUtilized: 0.50,
        displayName: 'Demo offer 1',
      },
      {
        start: 'Jan 03, 2023',
        end: 'Jan 03, 2024',
        id: TEST_ENTERPRISE_SUBSIDY_UUID_2,
        redeemedFunds: 500,
        remainingFunds: 500,
        totalFunds: 1000,
        percentUtilized: 0.50,
        displayName: 'Demo offer 2',
      },
    ];
    expect(result.current).toEqual({
      allBudgets: expectedResult,
      isLoading: false,
    });
  });
});
describe('useOfferSummary', () => {
  it('should handle null enterprise offer', async () => {
    const { result } = renderHook(() => useOfferSummary(TEST_ENTERPRISE_UUID));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: false,
    });
  });

  it('should fetch summary data for enterprise offer', async () => {
    EnterpriseDataApiService.fetchEnterpriseOfferSummary.mockResolvedValueOnce({ data: mockOfferSummary });
    const { result, waitForNextUpdate } = renderHook(() => useOfferSummary(TEST_ENTERPRISE_UUID, mockEnterpriseOffer));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: true,
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).toHaveBeenCalled();
    const expectedResult = {
      totalFunds: 5000,
      redeemedFunds: 200,
      redeemedFundsExecEd: NaN,
      redeemedFundsOcm: NaN,
      remainingFunds: 4800,
      percentUtilized: 0.04,
      offerId: 1,
      budgetsSummary: [],
      offerType: undefined,
    };
    expect(result.current).toEqual({
      offerSummary: expectedResult,
      isLoading: false,
    });
  });
});

describe('useOfferRedemptions', () => {
  it('should fetch enrollment/redemptions metadata for enterprise offer', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce({ data: mockOfferEnrollmentsResponse });
    const budgetId = 'test-budget-id';
    const { result, waitForNextUpdate } = renderHook(() => useOfferRedemptions(
      TEST_ENTERPRISE_UUID,
      mockEnterpriseOffer.id,
      budgetId,
    ));

    expect(result.current).toMatchObject({
      offerRedemptions: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
      isLoading: true,
      fetchOfferRedemptions: expect.any(Function),
    });
    act(() => {
      result.current.fetchOfferRedemptions({
        pageIndex: 0, // `DataTable` uses zero-based indexing
        pageSize: 20,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
        filters: [
          { id: 'Enrollment Details', value: mockOfferEnrollments[0].user_email },
        ],
      });
    });

    await waitForNextUpdate();

    const expectedApiOptions = {
      page: 1,
      pageSize: 20,
      offerId: mockEnterpriseOffer.id,
      ordering: '-enrollment_date', // default sort order
      searchAll: mockOfferEnrollments[0].user_email,
      ignoreNullCourseListPrice: true,
      budgetId,
    };
    expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      expectedApiOptions,
    );
    expect(result.current).toMatchObject({
      offerRedemptions: {
        itemCount: 100,
        pageCount: 5,
        results: camelCaseObject(mockOfferEnrollments),
      },
      isLoading: false,
      fetchOfferRedemptions: expect.any(Function),
    });

    expect(expectedApiOptions.budgetId).toBe(budgetId);
  });
});
