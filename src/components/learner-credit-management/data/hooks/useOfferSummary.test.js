import { renderHook } from '@testing-library/react-hooks/dom';

import useOfferSummary from './useOfferSummary';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

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
