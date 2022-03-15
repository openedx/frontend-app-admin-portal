import { renderHook } from '@testing-library/react-hooks/dom';
import { waitFor } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import * as logging from '@edx/frontend-platform/logging';
import { useSubsidyRequestConfiguration } from '../hooks';
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

describe('useSubsidyRequestConfiguration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch subsidy request configuration if there is no enterpriseUUID', async () => {
    renderHook(() => useSubsidyRequestConfiguration(undefined));
    expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).not.toHaveBeenCalled();
  });

  it('should fetch subsidy request configuration', async () => {
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockResolvedValue(
      TEST_CONFIGURATION_RESPONSE,
    );
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

    await waitForNextUpdate();

    expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);

    expect(result.current.subsidyRequestConfiguration).toEqual(
      camelCaseObject(TEST_CONFIGURATION_RESPONSE.data),
    );
  });

  it('should fetch and return subsidy request configuration', async () => {
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockResolvedValue(
      TEST_CONFIGURATION_RESPONSE,
    );
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

    await waitForNextUpdate();

    expect(EnterpriseAccessApiService.getSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(result.current.subsidyRequestConfiguration).toEqual(
      camelCaseObject(TEST_CONFIGURATION_RESPONSE.data),
    );
  });

  it('should handle non 404 errors', async () => {
    const error = new Error('Error fetching subsidy request configuration');
    EnterpriseAccessApiService.getSubsidyRequestConfiguration.mockRejectedValue(error);
    const { waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

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

      const { result } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

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

      const { result } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

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

      const { result } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

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

      const { waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(TEST_ENTERPRISE_UUID));

      await waitForNextUpdate();

      expect(logging.logError).toHaveBeenCalledWith(error);
    });
  });
});
