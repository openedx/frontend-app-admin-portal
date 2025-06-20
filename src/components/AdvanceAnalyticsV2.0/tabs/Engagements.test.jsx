/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
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
  engagementOverTime: [
    {
      enterprise_enrollment_date: '2024-02-07T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
    {
      enterprise_enrollment_date: '2024-02-10T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
    {
      enterprise_enrollment_date: '2024-03-14T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
  ],
  topCoursesByEngagement: [
    {
      COURSE_KEY: 'IBM+ML0101EN',
      course_title: 'IBM: Machine Learning with Python: A Practical Introduction',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 729,
    },
    {
      COURSE_KEY: 'HarvardX+CS50P',
      course_title: 'HarvardX: CS50\'s Introduction to Programming with Python',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 709,
    },
    {
      COURSE_KEY: 'DoaneX+CMS-3162x',
      course_title: 'DoaneX: Business Writing Techniques',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 694,
    },
  ],
  topSubjectsByEngagement: [
    {
      COURSE_SUBJECT: 'computer-science',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 9631,
    },
    {
      COURSE_SUBJECT: 'computer-science',
      ENROLL_TYPE: 'audit',
      enrollment_count: 21,
    },
    {
      COURSE_SUBJECT: 'data-analysis-statistics',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 4901,
    },
  ],
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
  enrollmentsOverTime: [
    {
      enterprise_enrollment_date: '2024-02-07T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
    {
      enterprise_enrollment_date: '2024-02-10T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
    {
      enterprise_enrollment_date: '2024-03-14T00:00:00',
      enroll_type: 'certificate',
      enrollment_count: 1,
    },
  ],
  topCoursesByEnrollments: [
    {
      COURSE_KEY: 'IBM+ML0101EN',
      course_title: 'IBM: Machine Learning with Python: A Practical Introduction',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 729,
    },
    {
      COURSE_KEY: 'HarvardX+CS50P',
      course_title: 'HarvardX: CS50\'s Introduction to Programming with Python',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 709,
    },
    {
      COURSE_KEY: 'DoaneX+CMS-3162x',
      course_title: 'DoaneX: Business Writing Techniques',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 694,
    },
  ],
  topSubjectsByEnrollments: [
    {
      COURSE_SUBJECT: 'computer-science',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 9631,
    },
    {
      COURSE_SUBJECT: 'computer-science',
      ENROLL_TYPE: 'audit',
      enrollment_count: 21,
    },
    {
      COURSE_SUBJECT: 'data-analysis-statistics',
      ENROLL_TYPE: 'certificate',
      enrollment_count: 4901,
    },
  ],
};

const mockAnalyticsSkillsData = {
  topSkills: [],
  topSkillsByEnrollments: [],
  topSkillsByCompletions: [],
};

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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

const findReact = (dom, traverseUp = 0) => {
  const rkey = Object.keys(dom).find(key => key.startsWith('__reactFiber$'));
  const domFiber = dom[rkey];
  if (domFiber == null) { return null; }

  const GetCompFiber = fiber => {
    let parentFiber = fiber.return;
    while (typeof parentFiber.type === 'string') {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  };
  let compFiber = GetCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = GetCompFiber(compFiber);
  }
  return compFiber.stateNode;
};

describe('Rendering tests', () => {
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
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(0);
  });

  test('calls sendEnterpriseTrackEvent on chart click', async () => {
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
      data: mockEngagementChartsData,
    });

    hooks.useEnterpriseEnrollmentsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockEnrollmentChartsData,
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

    const chartContainer = document.getElementById('enrollments-over-time-chart');
    const plotlyChart = findReact(chartContainer.firstElementChild);
    if (plotlyChart) {
      plotlyChart.props.onClick({
        pointerX: 1140,
        pointerY: 247,
      });
    }
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1));
  });
});
