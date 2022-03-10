/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import EnterpriseAccessApiService from '../EnterpriseAccessApiService';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
axios.post = jest.fn();
const enterpriseAccessBaseUrl = `${process.env.ENTERPRISE_ACCESS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockLicenseRequestUUID = 'test-license-request-uuid';
const mockCouponCodeRequestUUID = 'test-coupon-code-request-uuid';

describe('EnterpriseAccessApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('approveLicenseRequests calls enterprise-access to approve requests', () => {
    EnterpriseAccessApiService.approveLicenseRequests({
      enterpriseId: mockEnterpriseUUID,
      licenseRequestUUIDs: [mockLicenseRequestUUID],
      subscriptionPlanUUID: 'test-subscription-uuid',
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/license-requests/approve/`, {
      enterprise_customer_uuid: 'test-enterprise-id',
      send_notification: true,
      subscription_plan_uuid: 'test-subscription-uuid',
      subsidy_request_uuids: [mockLicenseRequestUUID],
    });
  });

  test('declineLicenseRequests calls enterprise-access to decline requests', () => {
    EnterpriseAccessApiService.declineLicenseRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDS: [mockLicenseRequestUUID],
      sendNotification: true,
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/license-requests/decline/`, {
      subsidy_request_uuids: [mockLicenseRequestUUID],
      enterprise_customer_uuid: mockEnterpriseUUID,
      send_notification: true,
    });
  });

  test('getLicenseRequestOverview calls enterprise-access to fetch license requests overview', () => {
    EnterpriseAccessApiService.getLicenseRequestOverview(mockEnterpriseUUID, {
      search: 'edx',
    });
    expect(axios.get).toBeCalledWith(
          `${enterpriseAccessBaseUrl}/api/v1/license-requests/overview/?enterprise_customer_uuid=${mockEnterpriseUUID}&search=edx`,
    );
  });

  test('approveCouponCodeRequests calls enterprise-access to approve requests', () => {
    EnterpriseAccessApiService.approveCouponCodeRequests({
      enterpriseId: mockEnterpriseUUID,
      couponCodeRequestUUIDs: [mockCouponCodeRequestUUID],
      couponId: 'test-coupon-id',
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/approve/`, {
      enterprise_customer_uuid: 'test-enterprise-id',
      send_notification: true,
      coupon_id: 'test-coupon-id',
      subsidy_request_uuids: [mockCouponCodeRequestUUID],
    });
  });

  test('declineCouponCodeRequests calls enterprise-access to decline requests', () => {
    EnterpriseAccessApiService.declineCouponCodeRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDS: [mockCouponCodeRequestUUID],
      sendNotification: true,
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/decline/`, {
      subsidy_request_uuids: [mockCouponCodeRequestUUID],
      enterprise_customer_uuid: mockEnterpriseUUID,
      send_notification: true,
    });
  });

  test('getCouponCodeRequestOverview calls enterprise-access to fetch coupon code requests overview', () => {
    EnterpriseAccessApiService.getCouponCodeRequestOverview(mockEnterpriseUUID, {
      search: 'edx',
    });
    expect(axios.get).toBeCalledWith(
          `${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/overview/?enterprise_customer_uuid=${mockEnterpriseUUID}&search=edx`,
    );
  });
});
