/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Progress from './Progress';
import { queryClient } from '../../test/testUtils';
import * as hooks from '../data/hooks';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';

jest.mock('../AnalyticsFiltersContext', () => ({
  useAnalyticsFilters: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useEnterpriseAnalyticsAggregatesData: jest.fn(),
  useEnterpriseCompletionsData: jest.fn(),
  useEnterpriseCourses: jest.fn(),
}));

jest.mock('../tables/TopCoursesByCompletionTable', () => function MockTopCoursesByCompletionTable() {
  return <div>TopCoursesByCompletionTable</div>;
});
jest.mock('../tables/TopSubjectsByCompletionTable', () => function MockTopSubjectsByCompletionTable() {
  return <div>TopSubjectsByCompletionTable</div>;
});
jest.mock('../tables/IndividualCompletionsTable', () => function MockIndividualCompletionsTable() {
  return <div>IndividualCompletionsTable</div>;
});

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

describe('Progress Component', () => {
  afterEach(() => {
    axiosMock.reset();
    jest.resetAllMocks();
  });

  test('renders all progress tab sections', async () => {
    useAnalyticsFilters.mockReturnValue({
      startDate: '2021-01-01',
      setStartDate: jest.fn(),
      endDate: '2021-12-31',
      setEndDate: jest.fn(),
      granularity: 'Daily',
      setGranularity: jest.fn(),
      calculation: 'Total',
      setCalculation: jest.fn(),
      groupUUID: 'group-123',
      setGroupUUID: jest.fn(),
      currentDate: '2021-12-31',
      groups: [],
      isGroupsLoading: false,
    });

    hooks.useEnterpriseAnalyticsAggregatesData.mockReturnValue({
      data: { minEnrollmentDate: '2021-01-01' },
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: {
        topCoursesByCompletions: [],
        topSubjectsByCompletions: [],
      },
    });

    hooks.useEnterpriseCourses.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { value: 'course-v1:edX+TST101+2024', label: 'Test Course 1' },
        { value: 'course-v1:edX+TST102+2024', label: 'Test Course 2' },
      ],
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Progress enterpriseId="abc-123" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    // Assert presence of major static content and mocked table components
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    });

    expect(
      screen.getByText(/This tab displays metrics that describe your learners/),
    ).toBeInTheDocument();

    expect(screen.getByText('TopCoursesByCompletionTable')).toBeInTheDocument();
    expect(screen.getByText('TopSubjectsByCompletionTable')).toBeInTheDocument();
    expect(screen.getByText('IndividualCompletionsTable')).toBeInTheDocument();
  });
});
