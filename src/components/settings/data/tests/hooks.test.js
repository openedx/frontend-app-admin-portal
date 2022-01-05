import Router from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { waitFor } from '@testing-library/react';

import LmsApiService from '../../../../data/services/LmsApiService';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import {
  useCurrentSettingsTab,
  useLinkManagement,
  useCustomerAgreementData,
} from '../hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
jest.mock('../../../../data/services/LmsApiService');
jest.mock('../../../../data/services/LicenseManagerAPIService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('settings hooks', () => {
  describe('useCurrentSettingsTab', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('returns expected route param', () => {
      jest.spyOn(Router, 'useParams').mockReturnValue({ settingsTab: 'access' });
      const { result } = renderHook(useCurrentSettingsTab);
      expect(result.current).toEqual('access');
    });
  });

  describe('useLinkManagement', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('success', () => {
      const expectedData = [
        { uuid: 'test-uuid-1' },
        { uuid: 'test-uuid-2' },
      ];
      const expectedResponse = {
        data: expectedData,
      };
      LmsApiService.getAccessLinks.mockResolvedValue(expectedResponse);
      const queryParams = new URLSearchParams();
      queryParams.append('enterprise_customer_uuid', TEST_ENTERPRISE_UUID);

      let result;
      act(() => {
        ({ result } = renderHook(() => useLinkManagement(TEST_ENTERPRISE_UUID)));
        expect(result.current).toStrictEqual({
          links: [],
          loadingLinks: true,
          refreshLinks: expect.any(Function),
        });
      });
      waitFor(() => {
        expect(result.current).toStrictEqual({
          links: expectedData,
          loadingLinks: false,
          refreshLinks: expect.any(Function),
        });
      });
    });
  });

  describe('useCustomerAgreementData', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    test('success', () => {
      const NET_DAYS_UNTIL_EXPIRATION = 100;
      const expectedResponse = {
        data: {
          count: 1,
          results: [{
            enterprise_customer_slug: 'test-enterprise',
            net_days_until_expiration: NET_DAYS_UNTIL_EXPIRATION,
            ordered_subscription_plan_expirations: [{ title: 'Test Sub' }],
            subscription_for_auto_applied_licenses: null,
            subscriptions: [{ title: 'Test Sub' }],
            uuid: '54358914-ca53-469e-a478-c591b7ec346e',
          }],
        },
      };
      LicenseManagerApiService.fetchCustomerAgreementData.mockResolvedValue(expectedResponse);
      let result;
      act(() => {
        ({ result } = renderHook(() => useCustomerAgreementData(TEST_ENTERPRISE_UUID)));
        expect(result.current).toStrictEqual({
          customerAgreement: { netDaysUntilExpiration: 0 },
          loadingCustomerAgreement: true,
        });
      });
      waitFor(() => {
        expect(result.current).toStrictEqual({
          customerAgreement: { netDaysUntilExpiration: NET_DAYS_UNTIL_EXPIRATION },
          loadingLinks: false,
        });
      });
    });
  });
});
