/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import SubsidyApiService from '../EnterpriseSubsidyApiService';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('EnterpriseSubsidyApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchCustomerTransactions calls the API to fetch transactions by enterprise subsidy', () => {
    const mockSubsidyUUID = 'test-subsidy-uuid';
    const expectedUrl = `${SubsidyApiService.baseUrlV2}/subsidies/${mockSubsidyUUID}/admin/transactions/?state=committed`;
    SubsidyApiService.fetchCustomerTransactions(mockSubsidyUUID);
    expect(axios.get).toBeCalledWith(expectedUrl);
  });

  test('getSubsidyByCustomerUUID calls the API to fetch subsides by enterprise customer UUID', () => {
    const mockCustomerUUID = 'test-customer-uuid';
    const expectedUrl = `${SubsidyApiService.baseUrlV1}/subsidies/?enterprise_customer_uuid=${mockCustomerUUID}`;
    SubsidyApiService.getSubsidyByCustomerUUID(mockCustomerUUID);
    expect(axios.get).toBeCalledWith(expectedUrl);
  });
});
