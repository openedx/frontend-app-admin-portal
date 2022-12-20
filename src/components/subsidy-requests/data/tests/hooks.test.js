import { renderHook } from '@testing-library/react-hooks/dom';
import { waitFor, act } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import * as logging from '@edx/frontend-platform/logging';
import {
  useSubsidyRequestConfiguration,
  useSubsidyRequestsOverview,
} from '../hooks';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

jest.mock('../../../../data/services/EcommerceApiService');
jest.mock('../../../../data/services/LicenseManagerAPIService');
jest.mock('../../../../data/services/EnterpriseAccessApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const createSubsidyRequestConfigurationResponse = (
  {
    enterpriseCustomerUUID = TEST_ENTERPRISE_UUID,
    subsidyRequestsEnabled = false,
    subsidyType = SUPPORTED_SUBSIDY_TYPES.license,
  } = {
    enterpriseCustomerUUID: TEST_ENTERPRISE_UUID,
    subsidyRequestsEnabled: false,
    subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
  },
) => ({
  data: {
    enterprise_customer_uuid: enterpriseCustomerUUID,
    subsidy_requests_enabled: subsidyRequestsEnabled,
    subsidy_type: subsidyType,
  },
});

const TEST_CONFIGURATION_RESPONSE = createSubsidyRequestConfigurationResponse();

const TEST_REQUEST_OVERVIEW_RESPONSE = { data: [{ state: 'requested', count: 5 }] };

describe('useSubsidyRequestConfiguration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch subsidy request configuration if there is no enterpriseUUID', async () => {
    renderHook(() => useSubsidyRequestConfiguration({
      enterpriseId: undefined,
      enterpriseSubsidyTypesForRequests: [],
    }));
    expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).not.toHaveBeenCalled();
  });

  it('should fetch and return subsidy request configuration', async () => {
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockResolvedValue(
      TEST_CONFIGURATION_RESPONSE,
    );
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration({
      enterpriseId: TEST_ENTERPRISE_UUID,
      enterpriseSubsidyTypesForRequests: [],
    }));

    await waitForNextUpdate();

    expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).toHaveBeenCalledWith(
      { clearCacheEntry: false, enterpriseId: TEST_ENTERPRISE_UUID },
    );
    expect(result.current.subsidyRequestConfiguration).toEqual(
      camelCaseObject(TEST_CONFIGURATION_RESPONSE.data),
    );
  });

  it('should handle non-404 errors', async () => {
    const error = new Error('Error fetching subsidy request configuration');
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockRejectedValue(error);
    const { waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration({
      enterpriseId: TEST_ENTERPRISE_UUID,
      enterpriseSubsidyTypesForRequests: [],
    }));

    await waitForNextUpdate();

    expect(logging.logError).toHaveBeenCalledWith(error);
  });

  describe('creating new subsidy request configuration if one does not exist', () => {
    beforeEach(() => {
      EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockRejectedValue(
        {
          customAttributes: {
            httpErrorStatus: 404,
          },
        },
      );
    });

    it('should create a configuration with subsidyType set to null if the enterprise has both subsidy types', async () => {
      const expectedConfigurationResponse = createSubsidyRequestConfigurationResponse(
        {
          subsidyType: null,
        },
      );

      EcommerceApiService.fetchCouponOrders.mockResolvedValue({ data: { results: [{ uuid: 'test-coup-uuid' }] } });
      LicenseManagerApiService.fetchSubscriptions.mockResolvedValue({ data: { results: [{ uuid: 'test-sub-uuid' }] } });
      EnterpriseAccessApiService.createSubsidyRequestConfiguration.mockResolvedValue(expectedConfigurationResponse);

      const { result } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitFor(() => {
        expect(EnterpriseAccessApiService.createSubsidyRequestConfiguration).toHaveBeenCalledWith({
          enterpriseId: TEST_ENTERPRISE_UUID,
          subsidyType: null,
        });

        expect(result.current.subsidyRequestConfiguration).toEqual(
          camelCaseObject(expectedConfigurationResponse.data),
        );
      });
    });

    it('should create a configuration with subsidyType set to license if the enterprise has subscriptions', async () => {
      const expectedConfigurationResponse = createSubsidyRequestConfigurationResponse(
        {
          subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
        },
      );

      EcommerceApiService.fetchCouponOrders.mockResolvedValue({ data: { results: [] } });
      LicenseManagerApiService.fetchSubscriptions.mockResolvedValue({ data: { results: [{ uuid: 'test-sub-uuid' }] } });
      EnterpriseAccessApiService.createSubsidyRequestConfiguration.mockResolvedValue(expectedConfigurationResponse);

      const { result } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitFor(() => {
        expect(EnterpriseAccessApiService.createSubsidyRequestConfiguration).toHaveBeenCalledWith({
          enterpriseId: TEST_ENTERPRISE_UUID,
          subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
        });

        expect(result.current.subsidyRequestConfiguration).toEqual(
          camelCaseObject(expectedConfigurationResponse.data),
        );
      });
    });

    it('should create a configuration with subsidyType set to coupon if the enterprise has coupons', async () => {
      const expectedConfigurationResponse = createSubsidyRequestConfigurationResponse(
        {
          subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
        },
      );

      EcommerceApiService.fetchCouponOrders.mockResolvedValue({ data: { results: [{ uuid: 'test-coup-uuid' }] } });
      LicenseManagerApiService.fetchSubscriptions.mockResolvedValue({ data: { results: [] } });
      EnterpriseAccessApiService.createSubsidyRequestConfiguration.mockResolvedValue(expectedConfigurationResponse);

      const { result } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitFor(() => {
        expect(EnterpriseAccessApiService.createSubsidyRequestConfiguration).toHaveBeenCalledWith({
          enterpriseId: TEST_ENTERPRISE_UUID,
          subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
        });

        expect(result.current.subsidyRequestConfiguration).toEqual(
          camelCaseObject(expectedConfigurationResponse.data),
        );
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Error fetching coupon orders');
      EcommerceApiService.fetchCouponOrders.mockRejectedValue(error);

      const { waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitForNextUpdate();

      expect(logging.logError).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSubsidyRequestConfiguration', () => {
    it('should update a configuration correctly', async () => {
      EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockResolvedValueOnce(
        createSubsidyRequestConfigurationResponse({
          subsidyRequestsEnabled: false,
        }),
      ).mockResolvedValueOnce(createSubsidyRequestConfigurationResponse({
        subsidyRequestsEnabled: true,
      }));

      EnterpriseAccessApiService.updateSubsidyRequestConfiguration.mockResolvedValueOnce(
        createSubsidyRequestConfigurationResponse({
          subsidyRequestsEnabled: true,
        }),
      );

      const { result } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitFor(() => {
        expect(result.current.subsidyRequestConfiguration.subsidyRequestsEnabled).toEqual(false);
      });

      const { updateSubsidyRequestConfiguration } = result.current;

      await act(() => updateSubsidyRequestConfiguration({
        isSubsidyRequestsEnabled: true,
      }));

      await waitFor(() => {
        expect(result.current.subsidyRequestConfiguration.subsidyRequestsEnabled).toEqual(true);
      });

      expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).toHaveBeenCalledWith(
        { clearCacheEntry: true, enterpriseId: TEST_ENTERPRISE_UUID },
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Error updating subsidy request configuration');
      EnterpriseAccessApiService.updateSubsidyRequestConfiguration.mockRejectedValue(error);

      const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration({
        enterpriseId: TEST_ENTERPRISE_UUID,
        enterpriseSubsidyTypesForRequests: [],
      }));

      await waitForNextUpdate();

      const { updateSubsidyRequestConfiguration } = result.current;

      await expect(() => updateSubsidyRequestConfiguration({
        isSubsidyRequestsEnabled: true,
      })).rejects.toThrowError(error);

      expect(logging.logError).toHaveBeenCalledWith(error);
    });
  });

  it('updates configuration if the enterprise adds a new subsidy and previously had none', async () => {
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockResolvedValueOnce(
      createSubsidyRequestConfigurationResponse({
        subsidyType: null,
        subsidyRequestsEnabled: false,
      }),
    ).mockResolvedValueOnce(
      createSubsidyRequestConfigurationResponse({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
        subsidyRequestsEnabled: false,
      }),
    );

    EnterpriseAccessApiService.updateSubsidyRequestConfiguration.mockResolvedValueOnce(
      createSubsidyRequestConfigurationResponse({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
        subsidyRequestsEnabled: false,
      }),
    );

    const enterpriseSubsidyTypesForRequests = [SUPPORTED_SUBSIDY_TYPES.coupon];
    renderHook(() => useSubsidyRequestConfiguration({
      enterpriseId: TEST_ENTERPRISE_UUID,
      enterpriseSubsidyTypesForRequests,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.updateSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, {
        subsidy_type: SUPPORTED_SUBSIDY_TYPES.coupon,
        subsidy_requests_enabled: undefined,
      });
    });
  });
});

describe('useSubsidyRequestsOverview', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch subsidy request configuration if there is no enterpriseId', async () => {
    renderHook(() => useSubsidyRequestsOverview(undefined));
    expect(EnterpriseAccessApiService.getLicenseRequestOverview).not.toHaveBeenCalled();
    expect(EnterpriseAccessApiService.getCouponCodeRequestOverview).not.toHaveBeenCalled();
  });

  it('fetches counts in initial loading state', async () => {
    const { result } = renderHook(() => useSubsidyRequestsOverview(TEST_ENTERPRISE_UUID));
    const actualResult = result.current;
    await waitFor(() => {
      expect(actualResult.isLoading).toBeTruthy();
      expect(actualResult.subsidyRequestsCounts).toEqual(
        expect.objectContaining({
          subscriptionLicenses: 0,
          couponCodes: 0,
        }),
      );
      expect(actualResult.refreshsubsidyRequestsCounts).toEqual(expect.any(Function));
      expect(actualResult.decrementLicenseRequestCount).toEqual(expect.any(Function));
      expect(actualResult.decrementCouponCodeRequestCount).toEqual(expect.any(Function));
    });
  });

  it('fetches outstanding subsidy request counts', async () => {
    EnterpriseAccessApiService.getLicenseRequestOverview.mockResolvedValue(
      TEST_REQUEST_OVERVIEW_RESPONSE,
    );
    EnterpriseAccessApiService.getCouponCodeRequestOverview.mockResolvedValue(
      TEST_REQUEST_OVERVIEW_RESPONSE,
    );

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestsOverview(TEST_ENTERPRISE_UUID));
    await waitForNextUpdate();

    const actualResult = result.current;
    expect(actualResult.isLoading).toBeFalsy();
    expect(actualResult.subsidyRequestsCounts).toEqual(
      expect.objectContaining({
        subscriptionLicenses: 5,
        couponCodes: 5,
      }),
    );
  });

  describe('decrement subsidy request counts', () => {
    it('decrements subscription license request count', async () => {
      EnterpriseAccessApiService.getLicenseRequestOverview.mockResolvedValue(
        TEST_REQUEST_OVERVIEW_RESPONSE,
      );

      const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestsOverview(TEST_ENTERPRISE_UUID));
      await waitForNextUpdate();

      const actualResult = result.current;
      expect(actualResult.subsidyRequestsCounts.subscriptionLicenses).toEqual(5);

      expect(actualResult.decrementLicenseRequestCount).toEqual(expect.any(Function));
      act(() => {
        actualResult.decrementLicenseRequestCount();
      });
      await waitFor(() => {
        expect(result.current.subsidyRequestsCounts.subscriptionLicenses).toEqual(4);
      });
    });

    it('decrements subscription license request count', async () => {
      EnterpriseAccessApiService.getCouponCodeRequestOverview.mockResolvedValue(
        TEST_REQUEST_OVERVIEW_RESPONSE,
      );

      const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestsOverview(TEST_ENTERPRISE_UUID));
      await waitForNextUpdate();

      const actualResult = result.current;
      expect(actualResult.subsidyRequestsCounts.couponCodes).toEqual(5);

      expect(actualResult.decrementCouponCodeRequestCount).toEqual(expect.any(Function));
      act(() => {
        actualResult.decrementCouponCodeRequestCount();
      });
      await waitFor(() => {
        expect(result.current.subsidyRequestsCounts.couponCodes).toEqual(4);
      });
    });
  });
});
