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

const mockAnalyticsLeaderboardTableData = [
  {
    email: 'user@example.com',
    sessionCount: 243,
    learningTimeSeconds: 1111,
    learningTimeHours: 3.4,
    averageSessionLength: 1.6,
    courseCompletionCount: 4,
  },
];

const mockEnterpriseUUID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('EnterpriseDataApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    axiosMock.reset();
  });

  test('fetchAdminAnalyticsData calls correct chart data API endpoint', async () => {
    const requestOptions = { startDate: '2021-01-01', endDate: '2021-12-31' };
    const queryParams = new URLSearchParams(snakeCaseObject(requestOptions));
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}`;
    const analyticsSkillsURL = `${baseURL}/skills/stats?${queryParams.toString()}`;
    axiosMock.onGet(`${analyticsSkillsURL}`).reply(200, mockAnalyticsSkillsData);
    const response = await EnterpriseDataApiService.fetchAdminAnalyticsData(mockEnterpriseUUID, 'skills', requestOptions);
    expect(axiosMock.history.get[0].url).toBe(analyticsSkillsURL);
    expect(response).toEqual(camelCaseObject(mockAnalyticsSkillsData));
  });
  test('fetchAdminAnalyticsData calls correct table data API endpoint', async () => {
    const requestOptions = { startDate: '2021-01-01', endDate: '2021-12-31' };
    const queryParams = new URLSearchParams(snakeCaseObject(requestOptions));
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}`;
    const analyticsLeaderboardURL = `${baseURL}/leaderboard?${queryParams.toString()}`;
    axiosMock.onGet(`${analyticsLeaderboardURL}`).reply(200, mockAnalyticsLeaderboardTableData);
    const response = await EnterpriseDataApiService.fetchAdminAnalyticsData(mockEnterpriseUUID, 'leaderboardTable', requestOptions);
    expect(axiosMock.history.get[0].url).toBe(analyticsLeaderboardURL);
    expect(response).toEqual(camelCaseObject(mockAnalyticsLeaderboardTableData));
  });
  test('fetchAdminAnalyticsData remove falsy query params', () => {
    const requestOptions = { startDate: '', endDate: null, otherDate: undefined };
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}`;
    const analyticsEnrollmentsURL = `${baseURL}/enrollments/stats?`;
    axiosMock.onGet(`${analyticsEnrollmentsURL}`).reply(200, []);
    EnterpriseDataApiService.fetchAdminAnalyticsData(mockEnterpriseUUID, 'enrollments', requestOptions);
    expect(axiosMock.history.get[0].url).toBe(analyticsEnrollmentsURL);
  });
  test('fetchEnterpriseCourses calls correct API endpoint and transforms response', async () => {
    const requestOptions = {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      courseType: 'OCM',
      groupUUID: 'group-xyz',
    };

    const mockApiResponse = [
      {
        course_key: 'course-v1:edX+TST101+2025',
        course_title: 'Test Course',
      },
    ];

    const snakeParams = new URLSearchParams({
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      course_type: 'OCM',
      group_uuid: 'group-xyz',
    });

    const expectedURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${mockEnterpriseUUID}/enrolled-courses?${snakeParams.toString()}`;
    axiosMock.onGet(expectedURL).reply(200, mockApiResponse);
    const response = await EnterpriseDataApiService.fetchEnterpriseCourses(mockEnterpriseUUID, requestOptions);
    expect(axiosMock.history.get[0].url).toBe(expectedURL);
    expect(response).toEqual(camelCaseObject(mockApiResponse));
  });
});
