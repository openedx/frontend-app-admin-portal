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

  test('approveBnrSubsidyRequest calls enterprise-access to approve BNR subsidy requests', () => {
    const mockBnrSubsidyRequestUUIDs = ['test-bnr-subsidy-request-uuid-1', 'test-bnr-subsidy-request-uuid-2'];

    EnterpriseAccessApiService.approveBnrSubsidyRequest({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDs: mockBnrSubsidyRequestUUIDs,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/approve/`, {
      learner_credit_request_uuids: mockBnrSubsidyRequestUUIDs,
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
    });
  });

  test('approveAllBnrSubsidyRequests calls enterprise-access to approve all BNR subsidy requests', () => {
    EnterpriseAccessApiService.approveAllBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/approve-all/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
    });
  });

  test('declineAllBnrSubsidyRequests calls enterprise-access to decline all BNR subsidy requests', () => {
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/decline-all/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
    });
  });

  test('declineAllBnrSubsidyRequests forwards declineReason when provided', () => {
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
      declineReason: 'Budget exhausted',
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/decline-all/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
      decline_reason: 'Budget exhausted',
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

  test('bulkDeclineBnrSubsidyRequests calls enterprise-access to decline BNR subsidy requests in bulk', () => {
    const mockBnrSubsidyRequestUUIDs = ['test-bnr-subsidy-request-uuid-1', 'test-bnr-subsidy-request-uuid-2'];

    EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDs: mockBnrSubsidyRequestUUIDs,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/decline/`, {
      subsidy_request_uuids: mockBnrSubsidyRequestUUIDs,
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
    });
  });

  test('bulkDeclineBnrSubsidyRequests forwards declineReason when provided', () => {
    const mockBnrSubsidyRequestUUIDs = ['test-bnr-subsidy-request-uuid-1', 'test-bnr-subsidy-request-uuid-2'];

    EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDs: mockBnrSubsidyRequestUUIDs,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
      declineReason: 'Outside policy scope',
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/decline/`, {
      subsidy_request_uuids: mockBnrSubsidyRequestUUIDs,
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
      decline_reason: 'Outside policy scope',
    });
  });

  test('cancelApprovedBnrSubsidyRequests calls enterprise-access to cancel BNR subsidy requests in bulk', () => {
    const mockBnrSubsidyRequestUUIDs = ['test-bnr-subsidy-request-uuid-1', 'test-bnr-subsidy-request-uuid-2'];

    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyRequestUUIDs: mockBnrSubsidyRequestUUIDs,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/bulk-cancel/`, {
      learner_credit_request_uuids: mockBnrSubsidyRequestUUIDs,
      enterprise_customer_uuid: mockEnterpriseUUID,
    });
  });

  test('cancelAllApprovedBnrSubsidyRequests calls enterprise-access cancel-all endpoint without learnerRequestState', () => {
    EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/cancel-all/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
    });
  });

  test('cancelAllApprovedBnrSubsidyRequests calls enterprise-access cancel-all endpoint with learnerRequestState', () => {
    EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests({
      enterpriseId: mockEnterpriseUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
      options: { learnerRequestState: 'waiting' },
    });

    expect(axios.post).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/learner-credit-requests/cancel-all/`, {
      enterprise_customer_uuid: mockEnterpriseUUID,
      policy_uuid: mockSubsidyAccessPolicyUUID,
      learner_request_state: 'waiting',
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
      `${enterpriseAccessBaseUrl}/api/v1/stripe-event-summary/get-stripe-subscription-plan-info/?${expectedParams.toString()}`,
    );
  });

  // ========== Billing Management Tests ==========

  describe('Billing Management Methods', () => {
    const mockPaymentMethodId = 'pm_test_123';
    const mockAddressData = {
      billingEmail: 'billing@example.com',
      organizationName: 'Test Org',
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    };

    test('getBillingAddress calls GET /address/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.getBillingAddress(mockEnterpriseUUID);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.get).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/address/?${expectedParams.toString()}`,
      );
    });

    test('updateBillingAddress calls POST /address/ with snake_case body and enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.updateBillingAddress(mockEnterpriseUUID, mockAddressData);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/address/?${expectedParams.toString()}`,
        {
          billing_email: 'billing@example.com',
          organization_name: 'Test Org',
          line_1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US',
        },
      );
    });

    test('getPaymentMethods calls GET /payment-methods/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.getPaymentMethods(mockEnterpriseUUID);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.get).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/payment-methods/?${expectedParams.toString()}`,
      );
    });

    test('addPaymentMethod calls POST /payment-methods/ with payment_method_id and enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.addPaymentMethod(mockEnterpriseUUID, mockPaymentMethodId);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/payment-methods/?${expectedParams.toString()}`,
        {
          payment_method_id: mockPaymentMethodId,
        },
      );
    });

    test('addPaymentMethod includes set_as_default when provided', async () => {
      await EnterpriseAccessApiService.addPaymentMethod(mockEnterpriseUUID, mockPaymentMethodId, true);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/payment-methods/?${expectedParams.toString()}`,
        {
          payment_method_id: mockPaymentMethodId,
          set_as_default: true,
        },
      );
    });

    test('setDefaultPaymentMethod calls POST /payment-methods/{id}/set-default/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.setDefaultPaymentMethod(mockEnterpriseUUID, mockPaymentMethodId);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/payment-methods/${mockPaymentMethodId}/set-default/?${expectedParams.toString()}`,
        {},
      );
    });

    test('deletePaymentMethod calls DELETE /payment-methods/{id}/ with enterprise_customer_uuid param', async () => {
      axios.delete = jest.fn();
      await EnterpriseAccessApiService.deletePaymentMethod(mockEnterpriseUUID, mockPaymentMethodId);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.delete).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/payment-methods/${mockPaymentMethodId}/?${expectedParams.toString()}`,
      );
    });

    test('getTransactions calls GET /transactions/ with limit and enterprise_customer_uuid params', async () => {
      await EnterpriseAccessApiService.getTransactions(mockEnterpriseUUID, 10);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
        limit: '10',
      });

      expect(axios.get).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/transactions/?${expectedParams.toString()}`,
      );
    });

    test('getTransactions includes page_token when provided', async () => {
      const mockPageToken = 'test-page-token';
      await EnterpriseAccessApiService.getTransactions(mockEnterpriseUUID, 10, mockPageToken);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
        limit: '10',
        page_token: mockPageToken,
      });

      expect(axios.get).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/transactions/?${expectedParams.toString()}`,
      );
    });

    test('getSubscription calls GET /subscription/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.getSubscription(mockEnterpriseUUID);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.get).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/subscription/?${expectedParams.toString()}`,
      );
    });

    test('cancelSubscription calls POST /subscription/cancel/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.cancelSubscription(mockEnterpriseUUID);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/subscription/cancel/?${expectedParams.toString()}`,
        {},
      );
    });

    test('reinstateSubscription calls POST /subscription/reinstate/ with enterprise_customer_uuid param', async () => {
      await EnterpriseAccessApiService.reinstateSubscription(mockEnterpriseUUID);

      const expectedParams = new URLSearchParams({
        enterprise_customer_uuid: mockEnterpriseUUID,
      });

      expect(axios.post).toBeCalledWith(
        `${enterpriseAccessBaseUrl}/api/v1/billing-management/subscription/reinstate/?${expectedParams.toString()}`,
        {},
      );
    });
  });
});
