/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import LmsApiService from '../LmsApiService';
import { configuration } from '../../../config';

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
      name: 'test-name',
      enterprise_customer: 'test-customer-uuid',
      members: [],
    });
    expect(response).toEqual({
      status: 201,
      data: {
        uuid: 'test-uuid',
        name: 'test-name',
        enterprise_customer: 'test-enterprise-customer',
        members: [],
      },
    });
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
});
