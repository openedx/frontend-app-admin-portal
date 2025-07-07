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
import Outcomess from './Outcomes';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import * as hooks from '../data/hooks';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';

const mockAnalyticsSkillsData = {
  topSkills: [
    {
      skillName: 'Python (Programming Language)', skillType: 'Specialized Skill', enrolls: 19031, completions: 3005,
    },
    {
      skillName: 'Data Science', skillType: 'Specialized Skill', enrolls: 13762, completions: 1521,
    },
    {
      skillName: 'Algorithms', skillType: 'Specialized Skill', enrolls: 12776, completions: 1640,
    },
  ],
  topSkillsByCompletions: [
    { skillName: 'Python (Programming Language)', subjectName: 'business-management', count: 21 },
    { skillName: 'Python (Programming Language)', subjectName: 'data-analysis-statistics', count: 393 },
    { skillName: 'Python (Programming Language)', subjectName: 'other', count: 12 },
  ],
  topSkillsByEnrollments: [
    { skillName: 'Python (Programming Language)', subjectName: 'business-management', count: 313 },
    { skillName: 'Python (Programming Language)', subjectName: 'data-analysis-statistics', count: 4460 },
    { skillName: 'Python (Programming Language)', subjectName: 'other', count: 262 },
  ],
};

const mockCompletionsChartsData = {
  completionsOverTime: [
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

jest.mock('../AnalyticsFiltersContext', () => ({
  useAnalyticsFilters: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useEnterpriseAnalyticsAggregatesData: jest.fn(),
  useEnterpriseAnalyticsData: jest.fn(),
  useEnterpriseCompletionsData: jest.fn(),
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
      data: { minEnrollmentDate: '2021-01-01' },
    });

    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: mockCompletionsChartsData,
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Outcomess enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    const sections = [
      {
        title: 'Outcomes',
        subtitle: 'This tab displays metrics that describe the outcomes of your learners engaging with learning content, including completions and skills gained. Use the date range and filters section to filter all the visualizations below it on the page. Dig deeper into the specific topics by downloading their associated CSVs.',
      },
      {
        title: 'Date range and filters',
        subtitle: '',
      },
      {
        title: 'Outcome and skills metrics',
        subtitle: '',
      },
      {
        title: 'Top Skills',
        subtitle: '',
      },
      {
        title: 'Completions Over Time',
        subtitle: 'Explore the top learners ranked by Outcomes metrics. The list is sorted by learning hours by default. To dive deeper, download the full CSV to explore and sort by other metrics. Only learners who have passed the course and completed at least one Outcomes activity (watching a video, submitting a problem, or posting in forums) are included.',
      },
      {
        title: 'Top Skills by Completion',
        subtitle: 'See audit and certificate track hours of learning over time.',
      },
    ];

    sections.forEach(({ title, subtitle }) => async () => {
      await waitFor(() => expect(screen.getByText(title)).toBeInTheDocument());
      await waitFor(() => expect(screen.getByText(subtitle)).toBeInTheDocument());
    });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(0);
  });

  test('calls sendEnterpriseTrackEvent on chart click', async () => {
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
      data: { minEnrollmentDate: '2021-01-01' },
    });

    hooks.useEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      isError: false,
      data: mockAnalyticsSkillsData,
    });

    hooks.useEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: mockCompletionsChartsData,
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Outcomess enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69" />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    const chartContainer = document.getElementById('completions-over-time-chart');
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
