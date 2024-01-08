import { renderHook } from '@testing-library/react-hooks';
import useAIAnalyticsSummary from '../data/hooks';
import LmsApiService from '../../../data/services/LmsApiService';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../data/services/LmsApiService', () => ({
  generateAIAnalyticsSummary: jest.fn(),
}));

const TEST_ENTERPRISE_ID = 'test-enterprise-uuid';

const mockInsightsData = {
  learner_progress: {
    enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    enterprise_customer_name: 'Microsoft Corporation',
    active_subscription_plan: true,
    assigned_licenses: 0,
    activated_licenses: 0,
    assigned_licenses_percentage: 0.0,
    activated_licenses_percentage: 0.0,
    active_enrollments: 1026,
    at_risk_enrollment_less_than_one_hour: 26,
    at_risk_enrollment_end_date_soon: 15,
    at_risk_enrollment_dormant: 918,
    created_at: '2023-10-02T03:24:17Z',
  },
  learner_engagement: {
    enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    enterprise_customer_name: 'Microsoft Corporation',
    enrolls: 49,
    enrolls_prior: 45,
    passed: 2,
    passed_prior: 0,
    engage: 67,
    engage_prior: 50,
    hours: 62,
    hours_prior: 49,
    contract_end_date: '2022-06-13T00:00:00Z',
    active_contract: false,
    created_at: '2023-10-02T03:24:40Z',
  },
};
const mockAnalyticsData = {
  learner_progress: 'As an administrator running an online learning program on edX For Business, currently, none of the licenses are active',
  learner_engagement: 'In the last 30 days, your online learning program on edX For Business has seen positive growth.',
};

describe('useAIAnalyticsSummary', () => {
  it('should fetch AI analytics summary data', async () => {
    LmsApiService.generateAIAnalyticsSummary.mockResolvedValueOnce({ data: mockAnalyticsData });
    const { result, waitForNextUpdate } = renderHook(() => useAIAnalyticsSummary(TEST_ENTERPRISE_ID, mockInsightsData));

    expect(result.current).toEqual({
      isLoading: true,
      error: null,
      data: null,
    });

    await waitForNextUpdate();

    expect(LmsApiService.generateAIAnalyticsSummary).toHaveBeenCalled();
    expect(result.current).toEqual({
      isLoading: false,
      error: null,
      data: mockAnalyticsData,
    });
  });

  it('should handle error when fetching AI analytics summary data', async () => {
    const error = new Error('An error occurred');
    LmsApiService.generateAIAnalyticsSummary.mockRejectedValueOnce(error);
    const { result, waitForNextUpdate } = renderHook(() => useAIAnalyticsSummary(TEST_ENTERPRISE_ID, mockInsightsData));

    expect(result.current).toEqual({
      isLoading: true,
      error: null,
      data: null,
    });

    await waitForNextUpdate();

    expect(LmsApiService.generateAIAnalyticsSummary).toHaveBeenCalled();
    expect(result.current).toEqual({
      isLoading: false,
      error,
      data: null,
    });
  });

  it('should not fetch data if enterpriseId or insights is missing', async () => {
    const { result } = renderHook(() => useAIAnalyticsSummary(TEST_ENTERPRISE_ID));

    expect(result.current).toEqual({
      isLoading: false,
      data: null,
      error: null,
    });
  });
});
