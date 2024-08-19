/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useEnterpriseSkillsAnalytics } from './hooks';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import { queryClient } from '../../test/testUtils';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsSkills');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockAnalyticsSkillsData = {
  top_skills: [],
  top_skills_by_enrollments: [],
  top_skills_by_completions: [],
};

axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockAnalyticsSkillsData }));

const TEST_ENTERPRISE_ID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('useEnterpriseSkillsAnalytics', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );

  it('fetch skills analytics data', async () => {
    const startDate = '2021-01-01';
    const endDate = '2021-12-31';
    const requestOptions = { startDate, endDate };
    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseSkillsAnalytics(TEST_ENTERPRISE_ID, startDate, endDate),
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

    expect(EnterpriseDataApiService.fetchAdminAnalyticsSkills).toHaveBeenCalled();
    expect(EnterpriseDataApiService.fetchAdminAnalyticsSkills).toHaveBeenCalledWith(TEST_ENTERPRISE_ID, requestOptions);
    expect(result.current).toEqual(expect.objectContaining({
      isLoading: false,
      error: null,
      data: camelCaseObject(mockAnalyticsSkillsData),
    }));
  });
});
