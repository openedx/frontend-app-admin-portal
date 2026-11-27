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
const mockPolicyId = 'test-policy-id';
const mockLicenseRequestUUID = 'test-license-request-uuid';
const mockCouponCodeRequestUUID = 'test-coupon-code-request-uuid';
const mockAssignmentConfigurationUUID = 'test-assignment-configuration-uuid';
const mockSubsidyAccessPolicyUUID = 'test-subsidy-access-policy-uuid';
const mockSubscriptionPlanUUID = 'test-subscription-plan-uuid';
const mockAssignmentUUIDs = ['test-assignment-uuid1', 'test-assignment-uuid-2'];

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

  test('listContentAssignments calls enterprise-access to fetch content assignments with learner state filter', () => {
    const options = {
      learnerState: ['notifying', 'waiting'],
    };
    EnterpriseAccessApiService.listContentAssignments(mockAssignmentConfigurationUUID, options);
    const expectedParams = new URLSearchParams({
      page: 1,
      page_size: 25,
      state__in: 'allocated,errored',
      learner_state__in: 'notifying,waiting',
    }).toString();
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/?${expectedParams}`,
    );
  });

  test('listContentAssignments calls enterprise-access to fetch content assignments without learner state filter', () => {
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

  test('listSubsidyAccessPolicies calls enterprise-access to fetch subsidy access policies', () => {
    EnterpriseAccessApiService.listSubsidyAccessPolicies(mockEnterpriseUUID);
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/subsidy-access-policies/?enterprise_customer_uuid=${mockEnterpriseUUID}&active=true`,
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
      content_key: 'edX+DemoX',
      content_price_cents: 19900,
    };
    EnterpriseAccessApiService.allocateContentAssignments(mockSubsidyAccessPolicyUUID, payload);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/policy-allocation/${mockSubsidyAccessPolicyUUID}/allocate/`,
      payload,
    );
  });

  test('cancelContentAssignments calls enterprise-access cancel POST API to cancel assignments', () => {
    const options = {
      assignment_uuids: mockAssignmentUUIDs,
    };
    EnterpriseAccessApiService.cancelContentAssignments(mockAssignmentConfigurationUUID, mockAssignmentUUIDs);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/cancel/`,
      options,
    );
  });

  test('remindContentAssignments calls enterprise-access remind POST API to remind learners', () => {
    const options = {
      assignment_uuids: mockAssignmentUUIDs,
    };
    EnterpriseAccessApiService.remindContentAssignments(mockAssignmentConfigurationUUID, mockAssignmentUUIDs);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/remind/`,
      options,
    );
  });

  test('cancelAllContentAssignments calls enterprise-access cancel-all POST API to cancel all assignments', () => {
    const options = {
      learnerState: 'pending,waiting',
    };
    EnterpriseAccessApiService.cancelAllContentAssignments(mockAssignmentConfigurationUUID, options);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/cancel-all/?learner_state__in=pending%2Cwaiting`,
    );
  });

  test('remindAllContentAssignments calls enterprise-access remind-all POST API to remind all learners', () => {
    const options = {
      learnerState: 'pending,waiting',
    };
    EnterpriseAccessApiService.remindAllContentAssignments(mockAssignmentConfigurationUUID, options);
    expect(axios.post).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/assignment-configurations/${mockAssignmentConfigurationUUID}/admin/assignments/remind-all/?learner_state__in=pending%2Cwaiting`,
    );
  });

  test('getLearnerCreditPlans calls enterprise-access to fetch learner credit plans', () => {
    const mockLmsUserId = 'test-lms-user-id';
    EnterpriseAccessApiService.getLearnerCreditPlans({
      enterpriseId: mockEnterpriseUUID,
      lmsUserId: mockLmsUserId,
    });
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/policy-redemption/credits_available/?enterprise_customer_uuid=${mockEnterpriseUUID}&lms_user_id=${mockLmsUserId}`,
    );
  });

  test('fetchAdminLearnerProfileData calls enterprise-access with correct query params', () => {
    const testUserEmail = 'markscout@lumon.com';
    const testLmsUserId = 2;

    const queryParams = new URLSearchParams({
      user_email: testUserEmail,
      lms_user_id: testLmsUserId,
      enterprise_customer_uuid: mockEnterpriseUUID,
    });

    EnterpriseAccessApiService.fetchAdminLearnerProfileData(testUserEmail, testLmsUserId, mockEnterpriseUUID);

    expect(axios.get).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/admin-view/learner_profile/?${queryParams.toString()}`);
  });
  test('fetchBnrSubsidyRequests calls enterprise-access with enterpriseUUID only', () => {
    EnterpriseAccessApiService.fetchBnrSubsidyRequests(mockEnterpriseUUID, mockPolicyId);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/?${expectedParams.toString()}`,
    );
  });

  test('approveBnrSubsidyRequest calls enterprise-access to approve BNR subsidy request', () => {
    const mockBnrSubsidyRequestUUIDs = ['test-bnr-subsidy-request-uuid'];

    EnterpriseAccessApiService.approveBnrSubsidyRequest({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDs: mockBnrSubsidyRequestUUIDs,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/bulk-approve/`, {
      subsidy_request_uuids: mockBnrSubsidyRequestUUIDs,
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,

    });
  });

  test('fetchBnrSubsidyRequests calls enterprise-access with enterpriseUUID and options', () => {
    const options = {
      page: 2,
      page_size: 10,
      state: 'requested,declined',
      search: 'test@example.com',
      ordering: '-created',
    };

    EnterpriseAccessApiService.fetchBnrSubsidyRequests(mockEnterpriseUUID, mockPolicyId, options);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
      page: '2',
      page_size: '10',
      state: 'requested,declined',
      search: 'test@example.com',
      ordering: '-created',
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/?${expectedParams.toString()}`,
    );
  });

  test('declineBnrSubsidyRequest calls enterprise-access to decline BNR subsidy request', () => {
    const mockBnrSubsidyRequestUUID = 'test-bnr-subsidy-request-uuid';

    EnterpriseAccessApiService.declineBnrSubsidyRequest({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUID: mockBnrSubsidyRequestUUID,
      sendNotification: true,
      declineReason: '',
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/decline/`, {
      subsidy_request_uuid: mockBnrSubsidyRequestUUID,
      enterprise_customer_uuid: mockEnterpriseUUID,
      send_notification: true,
      decline_reason: '',
    });
  });

  test('fetchBnrSubsidyRequestsOverview calls enterprise-access with enterpriseId and policyId only', () => {
    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview calls enterprise-access with enterpriseId, policyId and empty options', () => {
    const options = {};

    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, options);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview calls enterprise-access with enterpriseId, policyId and search option', () => {
    const options = {
      search: 'test@example.com',
    };

    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, options);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
      search: 'test@example.com',
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview calls enterprise-access with enterpriseId, policyId and multiple options', () => {
    const options = {
      search: 'test@example.com',
      state: 'requested,declined',
      ordering: '-created',
      custom_param: 'custom_value',
    };

    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, options);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
      search: 'test@example.com',
      state: 'requested,declined',
      ordering: '-created',
      custom_param: 'custom_value',
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview calls enterprise-access with all possible query parameters', () => {
    const options = {
      page: '1',
      page_size: '25',
      state: 'requested',
      search: 'learner@example.com',
      ordering: 'created',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    };

    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, options);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
      page: '1',
      page_size: '25',
      state: 'requested',
      search: 'learner@example.com',
      ordering: 'created',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview handles undefined options parameter', () => {
    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, undefined);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchBnrSubsidyRequestsOverview handles null options parameter', () => {
    EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(mockEnterpriseUUID, mockPolicyId, null);

    const expectedParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockPolicyId,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/overview/?${expectedParams.toString()}`,
    );
  });

  test('fetchStripeEvent calls enterprise-access GET API to fetch upcoming invoice amount from StripeEventSummary', () => {
    EnterpriseAccessApiService.fetchStripeEvent(mockSubscriptionPlanUUID);

    const expectedParams = new URLSearchParams({
      subscription_plan_uuid: mockSubscriptionPlanUUID,
    });

    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/stripe-event-summary/first-invoice-upcoming-amount-due/?${expectedParams.toString()}`,
    );
  });
});
