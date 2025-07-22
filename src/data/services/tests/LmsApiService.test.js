/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import LmsApiService from '../LmsApiService';
import { configuration } from '../../../config';
import { camelCaseDict } from '../../../utils';

const lmsBaseUrl = `${configuration.LMS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockUsername = 'test_username';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.patch = jest.fn();
axios.post = jest.fn();
axios.get = jest.fn();

describe('LmsApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('updateEnterpriseCustomer calls the LMS to update the enterprise customer', () => {
    LmsApiService.updateEnterpriseCustomer(
      mockEnterpriseUUID,
      {
        slug: 'test-slug',
      },
    );

    expect(axios.patch).toBeCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise-customer/${mockEnterpriseUUID}/`,
      { slug: 'test-slug' },
    );
  });
  test('updateEnterpriseCustomerBranding calls the LMS to update the enterprise customer', () => {
    LmsApiService.updateEnterpriseCustomerBranding(
      mockEnterpriseUUID,
      {
        primary_color: '#A8DABC',
      },
    );

    expect(axios.patch).toBeCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise-customer-branding/update-branding/${mockEnterpriseUUID}/`,
      { primary_color: '#A8DABC' },
    );
  });
  test('updateUserActiveEnterprise calls the LMS to update the active linked enterprise org', () => {
    axios.get.mockReturnValue({
      data: {
        results: [{
          active: true,
          enterpriseCustomer: { uuid: 'test-uuid' },
        }],
      },
    });
    LmsApiService.updateUserActiveEnterprise(
      mockEnterpriseUUID,
    );
    const expectedFormData = new FormData();
    expectedFormData.append('enterprise', mockEnterpriseUUID);
    expect(axios.post).toBeCalledWith(
      `${lmsBaseUrl}/enterprise/select/active/`,
      expectedFormData,
    );
  });
  test('fetchEnterpriseLearnerData calls the LMS to fetch learner data', () => {
    axios.get.mockReturnValue({
      data: {
        results: [{
          active: true,
          enterpriseCustomer: { uuid: 'test-uuid' },
        }],
      },
    });
    LmsApiService.fetchEnterpriseLearnerData({ username: mockUsername });
    expect(axios.get).toBeCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise-learner/?username=${mockUsername}&page=1`,
    );
  });
  test('getActiveLinkedEnterprise returns the actively linked enterprise', async () => {
    axios.get.mockReturnValue({
      data: {
        results: [{
          active: true,
          enterpriseCustomer: { uuid: 'test-uuid' },
        }],
      },
    });
    const activeCustomer = await LmsApiService.fetchEnterpriseLearnerData({ username: mockUsername });
    expect(activeCustomer).toEqual([{ active: true, enterpriseCustomer: { uuid: 'test-uuid' } }]);
  });
  test('createEnterpriseGroup returns uuid for the post request', async () => {
    axios.post.mockReturnValue({
      status: 201,
      data: {
        uuid: 'test-uuid',
        name: 'test-name',
        enterprise_customer: 'test-enterprise-customer',
        members: [],
      },
    });
    const response = await LmsApiService.createEnterpriseGroup({
      groupName: 'test-name',
      enterpriseUUID: 'test-customer-uuid',
    });

    expect(response).toEqual({
      status: 201,
      data: {
        uuid: 'test-uuid',
        name: 'test-name',
        enterpriseCustomer: 'test-enterprise-customer',
        members: [],
      },
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise_group/`,
      {
        name: 'test-name',
        enterprise_customer: 'test-customer-uuid',
        members: [],
      },
    );
  });
  test('fetchReportingConfigs returns reporting configs', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        results: [{
          active: true,
          data_type: 'test-data-type',
          uuid: 'test-uuid',
          enterprise_customer: 'test-enterprise-customer',
        }],
      },
    });
    const response = await LmsApiService.fetchReportingConfigs('test-enterprise-customer', 1);
    expect(response).toEqual({
      status: 200,
      data: {
        results: [{
          active: true,
          data_type: 'test-data-type',
          uuid: 'test-uuid',
          enterprise_customer: 'test-enterprise-customer',
        }],
      },
    });
  });
  test('fetchEnterpriseGroup returns groups', async () => {
    const mockPayload = {
      status: 200,
      data: {
        results: [
          {
            next: null,
            previous: null,
            count: 2,
            num_pages: 1,
            current_page: 1,
            start: 0,
            results: [
              {
                enterprise_customer: 1234,
                name: 'test group',
                uuid: 'test-uuid',
                accepted_members_count: 1,
                group_type: 'flex',
                created: '2025-05-29T00:04:18.318397Z',
              },
            ],
          },
        ],
      },
    };

    axios.get.mockResolvedValue(mockPayload);
    const response = await LmsApiService.fetchEnterpriseGroup('test-uuid');
    expect(axios.get).toHaveBeenCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise_group/test-uuid/`,
    );
    expect(response).toEqual(camelCaseDict(mockPayload));
  });
  test('fetchEnterpriseGroupMemberships returns group memberships', async () => {
    const mockPayload = {
      status: 200,
      data: {
        results: [
          {
            next: null,
            previous: null,
            count: 2,
            num_pages: 1,
            current_page: 1,
            start: 0,
            results: [
              {
                lms_user_id: 1234,
                member_details: {
                  user_email: 'testname@edx.org',
                  user_name: 'testname',
                },
                group_name: 'test group',
              },
            ],
          },
        ],
      },
    };
    axios.get.mockResolvedValue(mockPayload);
    const response = await LmsApiService.fetchEnterpriseGroupMemberships({ lmsUserId: '1234', enterpriseUuid: 'test-uuid' });
    expect(axios.get).toHaveBeenCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise-group-membership/?lms_user_id=1234&enterprise_uuid=test-uuid`,
    );
    expect(response).toEqual(camelCaseDict(mockPayload));
  });
  test('updateCompletedTourFlows returns', async () => {
    const mockPayload = {
      status: 200,
      data: {
        message: 'Successfully added tour flow Flow Title to completed flows',
      },
    };
    axios.post.mockResolvedValue(mockPayload);
    const response = await LmsApiService.updateCompletedTourFlows('test-admin-uuid', 'test-flow-uuid');
    expect(axios.post).toHaveBeenCalledWith(
      `${lmsBaseUrl}/enterprise/api/v1/enterprise-customer-admin/test-admin-uuid/complete_tour_flow/`,
      { flow_uuid: 'test-flow-uuid' },
    );
    expect(response).toEqual(mockPayload);
  });
});
