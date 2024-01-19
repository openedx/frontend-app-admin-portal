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
    const activeCustomer = await LmsApiService.getActiveLinkedEnterprise(mockUsername);
    expect(activeCustomer).toEqual({ uuid: 'test-uuid' });
  });
});
