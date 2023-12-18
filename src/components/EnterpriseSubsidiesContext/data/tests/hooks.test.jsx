import { renderHook } from '@testing-library/react-hooks/dom';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import { QueryClientProvider } from '@tanstack/react-query';

import { useCoupons, useCustomerAgreement, useEnterpriseBudgets } from '../hooks';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../../data/services/EnterpriseSubsidyApiService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { BUDGET_TYPES } from '../../../EnterpriseApp/data/constants';
import { queryClient } from '../../../test/testUtils';

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
jest.mock('../../../../data/services/EcommerceApiService');
jest.mock('../../../../data/services/LicenseManagerAPIService');
jest.mock('../../../../data/services/EnterpriseAccessApiService');
jest.mock('../../../../data/services/EnterpriseSubsidyApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

describe('useEnterpriseBudgets', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );

  const fetchEnterpriseOffersSpy = jest.spyOn(EcommerceApiService, 'fetchEnterpriseOffers').mockResolvedValue({
    data: {
      results: [],
    },
  });
  const getSubsidyByCustomerUUIDSpy = jest.spyOn(SubsidyApiService, 'getSubsidyByCustomerUUID').mockResolvedValue({
    data: {
      results: [],
    },
  });
  const listSubsidyAccessPoliciesSpy = jest.spyOn(EnterpriseAccessApiService, 'listSubsidyAccessPolicies').mockResolvedValue({
    data: {
      results: [],
    },
  });

  const mockBudgetStart = dayjs().subtract(1, 'week').toISOString();
  const mockBudgetEnd = dayjs().add(1, 'week').toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch any budgets if enablePortalLearnerCreditManagementScreen is false', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: false,
        isTopDownAssignmentEnabled: false,
        enterpriseId: TEST_ENTERPRISE_UUID,
      }),
      { wrapper },
    );

    expect(EcommerceApiService.fetchEnterpriseOffers).not.toHaveBeenCalled();
    expect(SubsidyApiService.getSubsidyByCustomerUUID).not.toHaveBeenCalled();
    expect(EnterpriseAccessApiService.listSubsidyAccessPolicies).not.toHaveBeenCalled();

    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          canManageLearnerCredit: false,
          budgets: [],
        },
      }),
    );
  });

  it('should always fetch enterprise offers from ecommerce', async () => {
    const mockEcommerceResponse = [
      {
        id: 'uuid',
        display_name: 'offer-name',
        start_datetime: mockBudgetStart,
        end_datetime: mockBudgetEnd,
        is_current: true,
      },
    ];
    const mockBudgets = [{
      id: 'uuid',
      name: 'offer-name',
      start: mockBudgetStart,
      end: mockBudgetEnd,
      isCurrent: true,
      source: BUDGET_TYPES.ecommerce,
    }];
    fetchEnterpriseOffersSpy.mockResolvedValue({
      data: {
        results: mockEcommerceResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(fetchEnterpriseOffersSpy).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: mockBudgets,
          canManageLearnerCredit: true,
        },
      }),
    );
  });

  it('should fetch Subsidy-associated budgets from enterprise-subsidy when LC2 feature flag is disabled', async () => {
    const mockEnterpriseSubsidyResponse = [
      {
        uuid: 'offer-id',
        title: 'offer-name',
        activeDatetime: mockBudgetStart,
        expirationDatetime: mockBudgetEnd,
        isActive: true,
      },
    ];
    getSubsidyByCustomerUUIDSpy.mockResolvedValue({
      data: {
        results: mockEnterpriseSubsidyResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
        isTopDownAssignmentEnabled: false,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledTimes(1);
    expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      { subsidyType: 'learner_credit' },
    );
    expect(listSubsidyAccessPoliciesSpy).not.toHaveBeenCalled();

    const expectedBudgets = [
      {
        id: 'offer-id',
        name: 'offer-name',
        start: mockBudgetStart,
        end: mockBudgetEnd,
        isCurrent: true,
        source: BUDGET_TYPES.subsidy,
      },
      {
        id: 'uuid',
        name: 'offer-name',
        start: mockBudgetStart,
        end: mockBudgetEnd,
        isCurrent: true,
        source: BUDGET_TYPES.ecommerce,
      },
    ];

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: expectedBudgets,
          canManageLearnerCredit: true,
        },
      }),
    );
  });

  it('should fetch Subsidy Access Policies (budgets) from enterprise-access when LC2 feature flag is enabled', async () => {
    const mockEnterprisePoliciesResponse = [
      {
        uuid: 'budget-uuid',
        displayName: 'Budget Display name',
        subsidyActiveDatetime: mockBudgetStart,
        subsidyExpirationDatetime: mockBudgetEnd,
        active: true,
        aggregates: {
          spendAvailableUsd: 700,
          amountRedeemedUsd: 200,
          amountAllocatedUsd: 100,
        },
      },
    ];
    fetchEnterpriseOffersSpy.mockResolvedValue({
      data: {
        results: [],
      },
    });
    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: mockEnterprisePoliciesResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
        isTopDownAssignmentEnabled: true,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledTimes(1);
    expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(getSubsidyByCustomerUUIDSpy).not.toHaveBeenCalled();

    const expectedBudgets = [
      {
        id: 'budget-uuid',
        name: 'Budget Display name',
        start: mockBudgetStart,
        end: mockBudgetEnd,
        isCurrent: true,
        source: BUDGET_TYPES.policy,
        isAssignable: false,
        aggregates: {
          available: 700,
          spent: 200,
          pending: 100,
        },
      },
    ];

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: expectedBudgets,
          canManageLearnerCredit: true,
        },
      }),
    );
  });

  it.each([
    { isTopDownAssignmentEnabled: false },
    { isTopDownAssignmentEnabled: true },
  ])('should log error when budgets API request cannot be fulfilled (%s)', async ({ isTopDownAssignmentEnabled }) => {
    const mockListOffersError = 'error_list_offers';
    const mockListSubsidiesError = 'error_list_subsidies';
    const mockListPoliciesError = 'error_list_policies';

    fetchEnterpriseOffersSpy.mockRejectedValue(mockListOffersError);
    getSubsidyByCustomerUUIDSpy.mockRejectedValue(mockListSubsidiesError);
    listSubsidyAccessPoliciesSpy.mockRejectedValue(mockListPoliciesError);

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
        isTopDownAssignmentEnabled,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    // Assert the failed enterprise offers API call
    expect(logError).toHaveBeenCalledWith(mockListOffersError);

    if (isTopDownAssignmentEnabled) {
      // Assert the failed API call to list subsidy access policies from enterprise-access
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledTimes(1);
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(getSubsidyByCustomerUUIDSpy).not.toHaveBeenCalled();

      expect(logError).toHaveBeenCalledWith(mockListPoliciesError);
    } else {
      // Assert the failed API call to list subsidies from enterprise-subsidy
      expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledTimes(1);
      expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledWith(
        TEST_ENTERPRISE_UUID,
        { subsidyType: 'learner_credit' },
      );
      expect(listSubsidyAccessPoliciesSpy).not.toHaveBeenCalled();

      expect(logError).toHaveBeenCalledWith(mockListSubsidiesError);
    }
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: [],
          canManageLearnerCredit: false,
        },
      }),
    );
  });

  it.each('should set `canManageLearnerCredit` to false if no budgets are found', async () => {
    fetchEnterpriseOffersSpy.mockResolvedValue({
      data: {
        results: [],
      },
    });
    getSubsidyByCustomerUUIDSpy.mockResolvedValue({
      data: {
        results: [],
      },
    });
    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: [],
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: [],
          canManageLearnerCredit: false,
        },
      }),
    );
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

    fetchEnterpriseOffersSpy.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
    getSubsidyByCustomerUUIDSpy.mockResolvedValueOnce({
      data: {
        results: mockSubsidyServiceResponse,
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseBudgets({
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
      }),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledTimes(1);
    expect(getSubsidyByCustomerUUIDSpy).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      { subsidyType: 'learner_credit' },
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          budgets: mockOfferData,
          canManageLearnerCredit: true,
        },
      }),
    );
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
