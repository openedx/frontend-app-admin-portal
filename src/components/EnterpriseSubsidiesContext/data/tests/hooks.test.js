import { renderHook } from '@testing-library/react-hooks/dom';

import { useCoupons, useCustomerAgreement, useEnterpriseOffers } from '../hooks';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../../data/services/EnterpriseSubsidyApiService';
import { BUDGET_TYPES } from '../../../EnterpriseApp/data/constants';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EcommerceApiService');
jest.mock('../../../../data/services/LicenseManagerAPIService');
jest.mock('../../../../data/services/EnterpriseAccessApiService');
jest.mock('../../../../data/services/EnterpriseSubsidyApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

describe('useEnterpriseOffers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch enterprise offers if enablePortalLearnerCreditManagementScreen is false', async () => {
    const { result } = renderHook(() => useEnterpriseOffers({ enablePortalLearnerCreditManagementScreen: false }));

    expect(EcommerceApiService.fetchEnterpriseOffers).not.toHaveBeenCalled();
    expect(SubsidyApiService.getSubsidyByCustomerUUID).not.toHaveBeenCalled();

    expect(result.current).toEqual({
      offers: [],
      isLoading: false,
      canManageLearnerCredit: false,
    });
  });

  it('should fetch enterprise offers for the enterprise when data is available only in e-commerce', async () => {
    const mockEcommerceResponse = [
      {
        id: 'uuid',
        display_name: 'offer-name',
        start_datetime: '2021-05-15T19:56:09Z',
        end_datetime: '2100-05-15T19:56:09Z',
        is_current: true,
      },
    ];
    const mockOffers = [{
      id: 'uuid',
      name: 'offer-name',
      start: '2021-05-15T19:56:09Z',
      end: '2100-05-15T19:56:09Z',
      isCurrent: true,
      source: BUDGET_TYPES.ecommerce,
    }];

    SubsidyApiService.getSubsidyByCustomerUUID.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockEcommerceResponse,
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

  it('should fetch enterprise offers for the enterprise when data available in enterprise-subsidy', async () => {
    const mockEnterpriseSubsidyResponse = [
      {
        uuid: 'offer-id',
        title: 'offer-name',
        activeDatetime: '2021-05-15T19:56:09Z',
        expirationDatetime: '2100-05-15T19:56:09Z',
        isActive: true,
      },
    ];

    const mockEcommerceResponse = [
      {
        id: 'uuid',
        display_name: 'offer-name',
        start_datetime: '2021-05-15T19:56:09Z',
        end_datetime: '2100-05-15T19:56:09Z',
        is_current: true,
      },
    ];

    SubsidyApiService.getSubsidyByCustomerUUID.mockResolvedValueOnce({
      data: {
        results: mockEnterpriseSubsidyResponse,
      },
    });

    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockEcommerceResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      enablePortalLearnerCreditManagementScreen: true,
      enterpriseId: TEST_ENTERPRISE_UUID,
    }));

    await waitForNextUpdate();

    expect(SubsidyApiService.getSubsidyByCustomerUUID).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      { subsidyType: 'learner_credit' },
    );

    const expectedOffers = [
      {
        id: 'offer-id',
        name: 'offer-name',
        start: '2021-05-15T19:56:09Z',
        end: '2100-05-15T19:56:09Z',
        isCurrent: true,
        source: BUDGET_TYPES.subsidy,
      },
      {
        id: 'uuid',
        name: 'offer-name',
        start: '2021-05-15T19:56:09Z',
        end: '2100-05-15T19:56:09Z',
        isCurrent: true,
        source: BUDGET_TYPES.ecommerce,
      },
    ];

    expect(result.current).toEqual({
      offers: expectedOffers,
      isLoading: false,
      canManageLearnerCredit: true,
    });
  });

  it('should set canManageLearnerCredit to false if active enterprise offer or subsidy not found', async () => {
    const mockSubsidyServiceResponse = [];

    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
    SubsidyApiService.getSubsidyByCustomerUUID.mockResolvedValueOnce({
      data: {
        results: mockSubsidyServiceResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      enablePortalLearnerCreditManagementScreen: true,
      enterpriseId: TEST_ENTERPRISE_UUID,
    }));

    await waitForNextUpdate();

    expect(SubsidyApiService.getSubsidyByCustomerUUID).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      { subsidyType: 'learner_credit' },
    );

    const hasActiveOffersOrSubsidies = mockSubsidyServiceResponse.some(offer => offer.is_active);
    let canManageLearnerCredit = false;

    if (hasActiveOffersOrSubsidies) {
      canManageLearnerCredit = true;
    }

    expect(result.current).toEqual({
      offers: [],
      isLoading: false,
      canManageLearnerCredit,
    });
  });

  it('should return the active enterprise offer or subsidy when multiple available', async () => {
    const mockSubsidyServiceResponse = [
      {
        uuid: 'offer-1',
        title: 'offer-name',
        active_datetime: '2005-05-15T19:56:09Z',
        expiration_datetime: '2006-05-15T19:56:09Z',
        is_active: false,
      },
      {
        uuid: 'offer-2',
        title: 'offer-name-2',
        active_datetime: '2006-05-15T19:56:09Z',
        expiration_datetime: '2099-05-15T19:56:09Z',
        is_active: true,
      },
    ];
    const mockOfferData = [
      {
        id: 'offer-1',
        name: 'offer-name',
        start: '2005-05-15T19:56:09Z',
        end: '2006-05-15T19:56:09Z',
        isCurrent: false,
        source: BUDGET_TYPES.subsidy,
      },
      {
        id: 'offer-2',
        name: 'offer-name-2',
        start: '2006-05-15T19:56:09Z',
        end: '2099-05-15T19:56:09Z',
        isCurrent: true,
        source: BUDGET_TYPES.subsidy,
      },
    ];

    EcommerceApiService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
    SubsidyApiService.getSubsidyByCustomerUUID.mockResolvedValueOnce({
      data: {
        results: mockSubsidyServiceResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      enablePortalLearnerCreditManagementScreen: true,
      enterpriseId: TEST_ENTERPRISE_UUID,
    }));

    await waitForNextUpdate();

    expect(SubsidyApiService.getSubsidyByCustomerUUID).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      { subsidyType: 'learner_credit' },
    );
    expect(result.current).toEqual({
      offers: mockOfferData,
      isLoading: false,
      canManageLearnerCredit: true,
    });
  });
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
