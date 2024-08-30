/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject, camelCaseObject } from '@edx/frontend-platform/utils';
import { useEnterpriseAnalyticsData } from './hooks';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import { queryClient } from '../../test/testUtils';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockAnalyticsCompletionsChartsData = {
  completions_over_time: [],
  top_courses_by_completions: [],
  top_subjects_by_completions: [],
};

const mockAnalyticsLeaderboardTableData = [
  {
    email: 'user@example.com',
    dailySessions: 243,
    learningTimeSeconds: 1111,
    learningTimeHours: 3.4,
    averageSessionLength: 1.6,
    courseCompletions: 4,
  },
];

const TEST_ENTERPRISE_ID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('useEnterpriseAnalyticsData', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );

  it('fetch analytics chart data', async () => {
    const startDate = '2021-01-01';
    const endDate = '2021-12-31';
    const requestOptions = { startDate, endDate };
    const queryParams = new URLSearchParams(snakeCaseObject(requestOptions));
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${TEST_ENTERPRISE_ID}`;
    const analyticsCompletionsURL = `${baseURL}/completions/stats?${queryParams.toString()}`;
    axiosMock.onGet(`${analyticsCompletionsURL}`).reply(200, mockAnalyticsCompletionsChartsData);
    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseAnalyticsData({
        enterpriseCustomerUUID: TEST_ENTERPRISE_ID,
        key: 'completions',
        startDate,
        endDate,
      }),
      { wrapper },
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: true,
        error: null,
        data: undefined,
      }),
    );

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalled();
    expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalledWith(
      TEST_ENTERPRISE_ID,
      'completions',
      {
        calculation: undefined,
        endDate: '2021-12-31',
        granularity: undefined,
        page: undefined,
        startDate: '2021-01-01',
      },
    );
    expect(result.current).toEqual(expect.objectContaining({
      isLoading: false,
      error: null,
      data: camelCaseObject(mockAnalyticsCompletionsChartsData),
    }));
    expect(axiosMock.history.get[0].url).toBe(analyticsCompletionsURL);
  });
  it('fetch analytics table data', async () => {
    const startDate = '2021-01-01';
    const endDate = '2021-12-31';
    const requestOptions = { startDate, endDate };
    const queryParams = new URLSearchParams(snakeCaseObject(requestOptions));
    const baseURL = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${TEST_ENTERPRISE_ID}`;
    const analyticsLeaderboardURL = `${baseURL}/leaderboard?${queryParams.toString()}`;
    axiosMock.onGet(`${analyticsLeaderboardURL}`).reply(200, mockAnalyticsLeaderboardTableData);
    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseAnalyticsData({
        enterpriseCustomerUUID: TEST_ENTERPRISE_ID,
        key: 'leaderboardTable',
        startDate,
        endDate,
      }),
      { wrapper },
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: true,
        error: null,
        data: undefined,
      }),
    );

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalled();
    expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalledWith(
      TEST_ENTERPRISE_ID,
      'completions',
      {
        calculation: undefined,
        endDate: '2021-12-31',
        granularity: undefined,
        page: undefined,
        startDate: '2021-01-01',
      },
    );
    expect(result.current).toEqual(expect.objectContaining({
      isLoading: false,
      error: null,
      data: camelCaseObject(mockAnalyticsLeaderboardTableData),
    }));
    expect(axiosMock.history.get[0].url).toBe(analyticsLeaderboardURL);
  });
});
