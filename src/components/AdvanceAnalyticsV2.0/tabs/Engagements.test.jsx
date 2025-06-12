/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Engagements from './Engagements';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import * as hooks from '../data/hooks';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';

const mockEngagementTableData = {
  next: null,
  previous: null,
  count: 2,
  num_pages: 1,
  current_page: 1,
  results: [
    {
      email: 'user100@example.com',
      course_title: 'Course 1',
      activity_date: '2020-01-01',
      course_subject: 'Subject 1',
      learning_time_hours: 12,
    },
    {
      email: 'user200@example.com',
      course_title: 'Course 2',
      activity_date: '2021-01-01',
      course_subject: 'Subject 2',
      learning_time_hours: 22,
    },
  ],
};

const mockEngagementChartsData = {
  engagementOverTime: [],
  topCoursesByEngagement: [],
  topSubjectsByEngagement: [],
};

const mockEnrollmentTableData = {
  next: null,
  previous: null,
  count: 2,
  num_pages: 1,
  current_page: 1,
  results: [
    {
      email: 'user100@example.com',
      course_title: 'Course 1',
      course_subject: 'Subject 1',
      enroll_type: 'certificate',
      enterprise_enrollment_date: '2020-01-01',
    },
    {
      email: 'user200@example.com',
      course_title: 'Course 2',
      course_subject: 'Subject 2',
      enroll_type: 'certificate 2',
      enterprise_enrollment_date: '2021-01-01',
    },
  ],
};

const mockEnrollmentChartsData = {
  enrollmentsOverTime: [],
  topCoursesByEnrollments: [],
  topSubjectsByEnrollments: [],
};

const mockAnalyticsSkillsData = {
  topSkills: [],
  topSkillsByEnrollments: [],
  topSkillsByCompletions: [],
};

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

jest.mock('../AnalyticsFiltersContext', () => ({
  useAnalyticsFilters: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useEnterpriseAnalyticsAggregatesData: jest.fn(),
  useEnterpriseEngagementData: jest.fn(),
  useEnterpriseAnalyticsData: jest.fn(),
  useEnterpriseEnrollmentsData: jest.fn(),
  usePaginatedData: jest.fn(() => ({ itemCount: 0, pageCount: 0, data: [] })),
}));

jest.mock('../charts/LineChart', () => {
  const MockedLineChart = () => <div>Mocked LineChart</div>;
  return MockedLineChart;
});

jest.mock('../charts/BarChart', () => {
  const MockedBarChart = () => <div>Mocked BarChart</div>;
  return MockedBarChart;
});

describe('Engagements Component', () => {
  afterEach(() => {
    axiosMock.reset();
    jest.resetAllMocks();
  });

  test('renders all sections', async () => {
    axiosMock.onGet(/\/engagements\/stats(\?.*)/).reply(200, mockEngagementChartsData);
    axiosMock.onGet(/\/engagements(\?.*)/).reply(200, mockEngagementTableData);

    axiosMock.onGet(/\/enrollments\/stats(\?.*)/).reply(200, mockEnrollmentChartsData);
    axiosMock.onGet(/\/enrollments(\?.*)/).reply(200, mockEnrollmentTableData);

    useAnalyticsFilters.mockReturnValue({
      startDate: '2021-01-01',
      setStartDate: jest.fn(),
      endDate: '2021-12-31',
      setEndDate: jest.fn(),
      granularity: 'Daily',
      calculation: 'Total',
      groupUUID: 'group-123',
      setGroupUUID: jest.fn(),
      currentDate: '2021-12-31',
      groups: [],
      isGroupsLoading: false,
    });

    hooks.useEnterpriseAnalyticsAggregatesData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockEngagementChartsData,
    });

    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseEngagementData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: {
        engagementOverTime: [],
        topCoursesByEngagement: [],
        topSubjectsByEngagement: [],
      },
    });

    hooks.useEnterpriseEnrollmentsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: {
        enrollmentsOverTime: [],
        topCoursesByEnrollments: [],
        topSubjectsByEnrollments: [],
      },
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Engagements enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    const sections = [
      {
        title: 'Engagement',
        subtitle: 'This tab displays metrics that measure your learners’ engagement with learning content. Use the date range and filters section to filter all the visualizations below it on the page. Dig deeper into the specific topics by downloading their associated CSVs.',
      },
      {
        title: 'Date range and filters',
        subtitle: '',
      },
      {
        title: 'Engagement metrics',
        subtitle: '',
      },
      {
        title: 'Skills by enrollment',
        subtitle: '',
      },
      {
        title: 'Leaderboard',
        subtitle: 'Explore the top learners ranked by engagement metrics. The list is sorted by learning hours by default. To dive deeper, download the full CSV to explore and sort by other metrics. Only learners who have passed the course and completed at least one engagement activity (watching a video, submitting a problem, or posting in forums) are included.',
      },
      {
        title: 'Learning hours over time',
        subtitle: 'See audit and certificate track hours of learning over time.',
      },
      {
        title: 'Enrollments over time',
        subtitle: 'See audit and certificate track enrollments over time.',
      },
      {
        title: 'Top 10 courses by enrollment',
        subtitle: 'See the most popular courses at your organization.',
      },
      { title: 'Top 10 courses by learning hours', subtitle: 'See the most popular courses at your organization.' },
      {
        title: 'Top 10 subjects by enrollment',
        subtitle: 'See the subjects your learners are spending the most time in.',
      },
      {
        title: 'Top 10 subjects by learning hours',
        subtitle: 'See the subjects your learners are spending the most time in.',
      },
    ];

    sections.forEach(({ title, subtitle }) => async () => {
      await waitFor(() => expect(screen.getByText(title)).toBeInTheDocument());
      await waitFor(() => expect(screen.getByText(subtitle)).toBeInTheDocument());
    });
  });
});
