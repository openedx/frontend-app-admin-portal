/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import EnterpriseAccessApiService from '../EnterpriseAccessApiService';
import { SUPPORTED_SUBSIDY_TYPES } from '../../constants/subsidyRequests';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
axios.post = jest.fn();
axios.patch = jest.fn();
const enterpriseAccessBaseUrl = `${process.env.ENTERPRISE_ACCESS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockLicenseRequestUUID = 'test-license-request-uuid';
const mockCouponCodeRequestUUID = 'test-coupon-code-request-uuid';
const mockAssignmentConfigurationUUID = 'test-assignment-configuration-uuid';
const mockSubsidyAccessPolicyUUID = 'test-subsidy-access-policy-uuid';

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
      unlinkUsersFromEnterprise: false,
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/license-requests/decline/`, {
      subsidy_request_uuids: [mockLicenseRequestUUID],
      enterprise_customer_uuid: mockEnterpriseUUID,
      send_notification: true,
      unlink_users_from_enterprise: false,
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
      unlinkUsersFromEnterprise: true,
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/decline/`, {
      subsidy_request_uuids: [mockCouponCodeRequestUUID],
      enterprise_customer_uuid: mockEnterpriseUUID,
      send_notification: true,
      unlink_users_from_enterprise: true,
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

  test('getSubsidyRequestConfiguration calls enterprise-access to fetch subsidy request configuration', () => {
    EnterpriseAccessApiService.getSubsidyRequestConfiguration({ enterpriseId: mockEnterpriseUUID });
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/customer-configurations/${mockEnterpriseUUID}/`,
    );
  });

  test('createSubsidyRequestConfiguration calls enterprise-access to create a subsidy request configuration', () => {
    EnterpriseAccessApiService.createSubsidyRequestConfiguration({
      enterpriseId: mockEnterpriseUUID,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
    });
    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/customer-configurations/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      subsidy_requests_enabled: false,
      subsidy_type: SUPPORTED_SUBSIDY_TYPES.license,
    });
  });

  test('updateSubsidyRequestConfiguration calls enterprise-access to update a subsidy request configuration', () => {
    EnterpriseAccessApiService.updateSubsidyRequestConfiguration(
      mockEnterpriseUUID,
      {
        subsidy_requests_enabled: true,
        subsidy_type: SUPPORTED_SUBSIDY_TYPES.coupon,
      },
    );
    expect(axios.patch).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/customer-configurations/${mockEnterpriseUUID}/`, {
      subsidy_requests_enabled: true,
      subsidy_type: SUPPORTED_SUBSIDY_TYPES.coupon,
    });
  });

  test('listContentAssignments calls enterprise-access to fetch content assignments', () => {
    EnterpriseAccessApiService.listContentAssignments(mockAssignmentConfigurationUUID);
    const expectedParams = new URLSearchParams({
      page: 1,
      page_size: 25,
      state__in: 'allocated,errored',
    }).toString();
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/?${expectedParams}`,
    );
  });

  test('retrieveSubsidyAccessPolicy calls enterprise-access to fetch subsidy access policy', () => {
    EnterpriseAccessApiService.retrieveSubsidyAccessPolicy(mockSubsidyAccessPolicyUUID);
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/subsidy-access-policies/${mockSubsidyAccessPolicyUUID}/`,
    );
  });

  test('allocateContentAssignments calls enterprise-access allocate POST API to create assignments', () => {
    const payload = {
      learner_emails: ['edx@example.com'],
    };
    EnterpriseAccessApiService.allocateContentAssignments(mockSubsidyAccessPolicyUUID, payload);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/policy-allocation/${mockSubsidyAccessPolicyUUID}/allocate/`,
      payload,
    );
  });
});
