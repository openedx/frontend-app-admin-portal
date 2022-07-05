import { renderHook } from '@testing-library/react-hooks/dom';

import { useEnterpriseOffers } from '../hooks';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EcommerceApiService');

describe('useEnterpriseOffers', () => {
  it('should not fetch enterprise offers if enablePortalLearnerCreditManagementScreen is false', async () => {
    const { result } = renderHook(() => useEnterpriseOffers({ enablePortalLearnerCreditManagementScreen: false }));

    expect(EcommerceApiService.fetchEnterpriseOffers).not.toHaveBeenCalled();
    expect(result.current).toEqual({
      offers: [],
      isLoading: false,
      canManageLearnerCredit: false,
    });
  });

  it('should fetch enterprise offers for the enterprise', async () => {
    const mockOffers = [
      {
        uuid: 'uuid',
      },
    ];
    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockOffers,
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      enablePortalLearnerCreditManagementScreen: true,
    }));

    await waitForNextUpdate();

    expect(EcommerceApiService.fetchEnterpriseOffers).toHaveBeenCalled();
    expect(result.current).toEqual({
      offers: mockOffers,
      isLoading: false,
      canManageLearnerCredit: true,
    });
  });

  it.each([0, 2])('should set canManageLearnerCredit to false if enterprise does not have exactly 1 offer', async (
    offersCount,
  ) => {
    const mockOffers = [...Array(offersCount)].map((_, index) => ({
      uuid: `offer-${index}`,
    }));

    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockOffers,
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      enablePortalLearnerCreditManagementScreen: true,
    }));

    await waitForNextUpdate();

    expect(EcommerceApiService.fetchEnterpriseOffers).toHaveBeenCalled();
    expect(result.current).toEqual({
      offers: mockOffers,
      isLoading: false,
      canManageLearnerCredit: false,
    });
  });
});
