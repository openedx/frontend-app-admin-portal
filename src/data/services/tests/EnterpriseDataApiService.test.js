/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject, camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseDataApiService from '../EnterpriseDataApiService';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockAnalyticsSkillsData = {
  top_skills: [],
  top_skills_by_enrollments: [],
  top_skills_by_completions: [],
};

axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockAnalyticsSkillsData }));

const mockEnterpriseUUID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('EnterpriseDataApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchAdminAnalyticsSkills calls correct API endpoint', async () => {
    const requestOptions = { startDate: '2021-01-01', endDate: '2021-12-31' };
    const queryParams = new URLSearchParams(snakeCaseObject(requestOptions));
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}`;
    const analyticsSkillsURL = `${baseURL}/skills/stats?${queryParams.toString()}`;
    const response = await EnterpriseDataApiService.fetchAdminAnalyticsSkills(mockEnterpriseUUID, requestOptions);
    expect(axios.get).toBeCalledWith(analyticsSkillsURL);
    expect(response).toEqual(camelCaseObject(mockAnalyticsSkillsData));
  });
  test('fetchAdminAnalyticsSkills remove falsy query params', () => {
    const requestOptions = { startDate: '', endDate: null, otherDate: undefined };
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}`;
    const analyticsSkillsURL = `${baseURL}/skills/stats?`;
    EnterpriseDataApiService.fetchAdminAnalyticsSkills(mockEnterpriseUUID, requestOptions);
    expect(axios.get).toBeCalledWith(analyticsSkillsURL);
  });
});
