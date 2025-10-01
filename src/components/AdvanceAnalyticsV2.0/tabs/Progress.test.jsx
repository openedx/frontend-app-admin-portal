/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';
import Progress from './Progress';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import * as hooks from '../data/hooks';
import EVENT_NAMES from '../../../eventTracking';
import { DATE_RANGE } from '../data/constants';

const mockProgressChartsData = {
  topCoursesByCompletions: [
    {
      completionCount: 390,
      courseKey: 'MandarinX+MX502X',
      courseTitle: 'MandarinX: Mandarin Chinese Level 1',
      enrollType: 'certificate',
    },
  ],
  topSubjectsByCompletions: [
    {
      completionCount: 2245,
      courseSubject: 'computer-science',
      enrollType: 'certificate',
    },
  ],
};

const mockAnalyticsSkillsData = {
  topSkills: [],
  topSkillsByEnrollments: [],
  topSkillsByCompletions: [],
};

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');
getAuthenticatedHttpClient.mockReturnValue(axios);

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../data/hooks', () => ({
  useEnterpriseAnalyticsData: jest.fn(),
  useEnterpriseCompletionsData: jest.fn(),
  useEnterpriseCourses: jest.fn(),
  useEnterpriseBudgets: jest.fn(),
  usePaginatedData: jest.fn(() => ({ itemCount: 0, pageCount: 0, data: [] })),
}));

describe('Rendering tests', () => {
  test('renders all sections', async () => {
    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: mockProgressChartsData,
    });

    hooks.useEnterpriseCourses.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { value: 'course-v1:edX+TST101+2024', label: 'Test Course 1' },
        { value: 'course-v1:edX+TST102+2024', label: 'Test Course 2' },
      ],
    });

    hooks.useEnterpriseBudgets.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { subsidyAccessPolicyUuid: 'budget-uuid-1', subsidyAccessPolicyDisplayName: 'Budget 1' },
        { subsidyAccessPolicyUuid: 'budget-uuid-2', subsidyAccessPolicyDisplayName: 'Budget 2' },
      ],
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Progress enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    const sections = [
      {
        title: 'Progress',
        subtitle: 'This tab displays metrics that describe your learners and their learning progress, as well as popular subjects and courses in your organization. Use the date range and filters section to filter all the visualizations below it on the page. Dig deeper into the specific topics by downloading their associated CSVs.',
      },
      {
        title: 'Date range and filters',
        subtitle: '',
      },
      {
        title: 'Top 10 courses by completion',
        subtitle: 'See the courses in which your learners are most often achieving a passing grade.',
      },
      {
        title: 'Top 10 subjects by completion',
        subtitle: 'See the subjects in which your learners are most often achieving a passing grade.',
      },
      {
        title: 'Leaderboard',
        subtitle: 'Explore the top learners ranked by Progress metrics. The list is sorted by learning hours by default. To dive deeper, download the full CSV to explore and sort by other metrics. Only learners who have passed the course and completed at least one Progress activity (watching a video, submitting a problem, or posting in forums) are included.',
      },
      {
        title: 'Individual Completions',
        subtitle: 'See the individual completions from your organization.',
      },
    ];

    sections.forEach(({ title, subtitle }) => async () => {
      await waitFor(() => expect(screen.getByText(title)).toBeInTheDocument());
      await waitFor(() => expect(screen.getByText(subtitle)).toBeInTheDocument());
    });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(0);
  });

  test('calls sendEnterpriseTrackEvent on CSV download click', async () => {
    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: mockProgressChartsData,
    });

    hooks.useEnterpriseCourses.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { value: 'course-v1:edX+TST101+2024', label: 'Test Course 1' },
        { value: 'course-v1:edX+TST102+2024', label: 'Test Course 2' },
      ],
    });

    hooks.useEnterpriseBudgets.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { subsidyAccessPolicyUuid: 'budget-uuid-1', subsidyAccessPolicyDisplayName: 'Budget 1' },
        { subsidyAccessPolicyUuid: 'budget-uuid-2', subsidyAccessPolicyDisplayName: 'Budget 2' },
      ],
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Progress enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    const downloadLink = await screen.findByRole('link', { name: /download.*csv/i });
    await userEvent.click(downloadLink);

    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        '33ce6562-95e0-4ecf-a2a7-7d407eb96f69',
        EVENT_NAMES.ANALYTICS_V2.PROGRESS_CSV_DOWNLOAD_CLICKED,
        expect.objectContaining({ entityId: expect.any(String) }),
      );
    });
  });

  test('calls sendEnterpriseTrackEvent on filter change', async () => {
    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: mockProgressChartsData,
    });

    hooks.useEnterpriseCourses.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { value: 'course-v1:edX+TST101+2024', label: 'Test Course 1' },
        { value: 'course-v1:edX+TST102+2024', label: 'Test Course 2' },
      ],
    });

    hooks.useEnterpriseBudgets.mockReturnValue({
      isFetching: false,
      isError: false,
      data: [
        { subsidyAccessPolicyUuid: 'budget-uuid-1', subsidyAccessPolicyDisplayName: 'Budget 1' },
        { subsidyAccessPolicyUuid: 'budget-uuid-2', subsidyAccessPolicyDisplayName: 'Budget 2' },
      ],
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Progress enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );
    const dateRangeSelect = screen.getByLabelText(/Date range options/i);

    // change it to "Last 30 days"
    await userEvent.selectOptions(dateRangeSelect, 'last_30_days');

    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        '33ce6562-95e0-4ecf-a2a7-7d407eb96f69',
        EVENT_NAMES.ANALYTICS_V2.PROGRESS_FILTER_CLICKED,
        {
          name: 'Date range options',
          value: DATE_RANGE.LAST_30_DAYS,
        },
      );
    });
  });
});
