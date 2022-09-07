/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import LmsApiService from '../LmsApiService';
import { configuration } from '../../../config';

const lmsBaseUrl = `${configuration.LMS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.patch = jest.fn();

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
});
