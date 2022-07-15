import { renderHook } from '@testing-library/react-hooks/dom';

import { useCoupons, useCustomerAgreement, useEnterpriseOffers } from '../hooks';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EcommerceApiService');
jest.mock('../../../../data/services/LicenseManagerAPIService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

describe('useEnterpriseOffers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

    expect(EcommerceApiService.fetchEnterpriseOffers).toHaveBeenCalledWith({
      isCurrent: true,
    });
    expect(result.current).toEqual({
      offers: mockOffers,
      isLoading: false,
      canManageLearnerCredit: true,
    });
  });

  it.each([0, 2])(
    'should set canManageLearnerCredit to false if enterprise does not have exactly 1 offer', async (
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

      expect(EcommerceApiService.fetchEnterpriseOffers).toHaveBeenCalledWith(
        { isCurrent: true },
      );
      expect(result.current).toEqual({
        offers: mockOffers,
        isLoading: false,
        canManageLearnerCredit: false,
      });
    },
  );
});

describe('useCustomerAgreement', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch customer agreement for the enterprise', async () => {
    const mockCustomerAgreement = {
      subscriptions: [],
    };
    LicenseManagerApiService.fetchCustomerAgreementData.mockResolvedValueOnce({
      data: {
        results: [mockCustomerAgreement],
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useCustomerAgreement({
      enterpriseId: TEST_ENTERPRISE_UUID,
    }));

    await waitForNextUpdate();

    expect(LicenseManagerApiService.fetchCustomerAgreementData).toHaveBeenCalledWith({
      enterprise_customer_uuid: TEST_ENTERPRISE_UUID,
    });
    expect(result.current).toEqual({
      customerAgreement: mockCustomerAgreement,
      isLoading: false,
    });
  });

  it('should should not set customer agreement if results are empty', async () => {
    LicenseManagerApiService.fetchCustomerAgreementData.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useCustomerAgreement({
      enterpriseId: TEST_ENTERPRISE_UUID,
    }));

    await waitForNextUpdate();

    expect(LicenseManagerApiService.fetchCustomerAgreementData).toHaveBeenCalled();
    expect(result.current).toEqual({
      customerAgreement: undefined,
      isLoading: false,
    });
  });
});

describe('useCoupons', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch coupons for the enterprise', async () => {
    const mockCoupons = [{ uuid: 'test-coupon' }];
    EcommerceApiService.fetchCouponOrders.mockResolvedValueOnce({
      data: {
        results: mockCoupons,
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useCoupons());

    await waitForNextUpdate();

    expect(EcommerceApiService.fetchCouponOrders).toHaveBeenCalled();
    expect(result.current).toEqual({
      coupons: mockCoupons,
      isLoading: false,
    });
  });
});
