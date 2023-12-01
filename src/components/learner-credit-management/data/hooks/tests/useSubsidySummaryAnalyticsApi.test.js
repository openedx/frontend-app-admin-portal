import { renderHook } from '@testing-library/react-hooks/dom';
import { logError } from '@edx/frontend-platform/logging';

import useSubsidySummaryAnalyticsApi from '../useSubsidySummaryAnalyticsApi';
import EnterpriseDataApiService from '../../../../../data/services/EnterpriseDataApiService';

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

const mockOfferSummary = {
  offer_id: TEST_ENTERPRISE_OFFER_ID,
  status: 'Open',
  enterprise_customer_uuid: TEST_ENTERPRISE_UUID,
  amount_of_offer_spent: 200.00,
  max_discount: 5000.00,
  percent_of_offer_spent: 0.04,
  remaining_balance: 4800.00,
};
const mockEnterpriseOffer = {
  id: TEST_ENTERPRISE_OFFER_ID,
};

describe('useSubsidySummaryAnalyticsApi', () => {
  it('should handle null enterprise offer', async () => {
    const { result } = renderHook(() => useSubsidySummaryAnalyticsApi(TEST_ENTERPRISE_UUID));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: false,
    });
  });

  it.each([
    { shouldThrowApiException: false },
    { shouldThrowApiException: true },
  ])('should fetch summary data for enterprise offer (%s)', async ({ shouldThrowApiException }) => {
    const mockFetchError = 'mock fetch error';
    if (shouldThrowApiException) {
      EnterpriseDataApiService.fetchEnterpriseOfferSummary.mockRejectedValueOnce(mockFetchError);
    } else {
      EnterpriseDataApiService.fetchEnterpriseOfferSummary.mockResolvedValueOnce({ data: mockOfferSummary });
    }
    const {
      result,
      waitForNextUpdate,
    } = renderHook(() => useSubsidySummaryAnalyticsApi(TEST_ENTERPRISE_UUID, mockEnterpriseOffer));

    expect(result.current).toEqual({
      subsidySummary: undefined,
      isLoading: true,
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).toHaveBeenCalled();

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
  });
});
