import { renderHook } from '@testing-library/react-hooks/dom';
import { logError } from '@edx/frontend-platform/logging';

import useSubsidySummaryAnalyticsApi from '../useSubsidySummaryAnalyticsApi';
import EnterpriseDataApiService from '../../../../../data/services/EnterpriseDataApiService';
import { BUDGET_TYPES } from '../../../../EnterpriseApp/data/constants';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));
jest.mock('../../../../../data/services/EnterpriseDataApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_OFFER_ID = 1;
const TEST_ENTERPRISE_BUDGET_UUID = 'test-enterprise-budget-uuid';

const mockOfferSummary = {
  offer_id: TEST_ENTERPRISE_OFFER_ID,
  status: 'Open',
  enterprise_customer_uuid: TEST_ENTERPRISE_UUID,
  amount_of_offer_spent: 200.00,
  max_discount: 5000.00,
  percent_of_offer_spent: 0.04,
  remaining_balance: 4800.00,
};

describe('useSubsidySummaryAnalyticsApi', () => {
  const mockFetchEnterpriseOfferSummarySpy = jest.spyOn(EnterpriseDataApiService, 'fetchEnterpriseOfferSummary');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle null enterprise offer', async () => {
    const { result } = renderHook(() => useSubsidySummaryAnalyticsApi(TEST_ENTERPRISE_UUID));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: false,
    });
  });

  it.each([
    {
      budgetId: TEST_ENTERPRISE_OFFER_ID,
      budgetType: BUDGET_TYPES.ecommerce,
      shouldCallApi: true,
      shouldThrowApiException: false,
    },
    {
      budgetId: TEST_ENTERPRISE_BUDGET_UUID,
      budgetType: BUDGET_TYPES.subsidy,
      shouldCallApi: true,
      shouldThrowApiException: true,
    },
    {
      budgetId: TEST_ENTERPRISE_BUDGET_UUID,
      budgetType: BUDGET_TYPES.policy,
      shouldCallApi: false,
      shouldThrowApiException: false,
    },
  ])('should fetch summary data for enterprise offer (%s)', async ({
    budgetId,
    budgetType,
    shouldThrowApiException,
    shouldCallApi,
  }) => {
    const mockFetchError = 'mock fetch error';
    if (shouldThrowApiException) {
      mockFetchEnterpriseOfferSummarySpy.mockRejectedValue(mockFetchError);
    } else {
      mockFetchEnterpriseOfferSummarySpy.mockResolvedValue({ data: mockOfferSummary });
    }
    const mockBudget = {
      id: budgetId,
      source: budgetType,
    };

    const {
      result,
      waitForNextUpdate,
    } = renderHook(() => useSubsidySummaryAnalyticsApi(
      TEST_ENTERPRISE_UUID,
      mockBudget,
    ));

    if (shouldCallApi) {
      expect(result.current).toEqual({
        subsidySummary: undefined,
        isLoading: true,
      });
      await waitForNextUpdate();
      expect(mockFetchEnterpriseOfferSummarySpy).toHaveBeenCalled();

      if (shouldThrowApiException) {
        expect(logError).toHaveBeenCalledWith(mockFetchError);
        expect(result.current).toEqual({
          subsidySummary: undefined,
          isLoading: false,
        });
      } else {
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
          subsidySummary: expectedResult,
          isLoading: false,
        });
      }
    } else {
      expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).not.toHaveBeenCalled();
    }
  });

  it('should (not) handle subsidy access policies as the budget type', () => {
    const { result } = renderHook(() => useSubsidySummaryAnalyticsApi(TEST_ENTERPRISE_UUID, {
      id: TEST_ENTERPRISE_BUDGET_UUID,
      source: BUDGET_TYPES.policy,
    }));

    expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).not.toHaveBeenCalled();

    expect(result.current).toEqual({
      subsidySummary: undefined,
      isLoading: false,
    });
  });
});
