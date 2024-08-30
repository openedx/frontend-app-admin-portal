import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Engagements from './Engagements';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

const mockAnalyticsData = {
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
      activity_date: '20219-01-01',
      course_subject: 'Subject 2',
      learning_time_hours: 22,
    },
  ],
};

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockAnalyticsData }));

jest.mock('../charts/LineChart', () => {
  const MockedLineChart = () => <div>Mocked LineChart</div>;
  return MockedLineChart;
});

jest.mock('../charts/BarChart', () => {
  const MockedBarChart = () => <div>Mocked BarChart</div>;
  return MockedBarChart;
});

describe('Engagements Component', () => {
  test('renders all sections with correct classes and content', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          <Engagements
            enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
            startDate="2021-01-01"
            endDate="2021-12-31"
            granularity="Daily"
            calculation="Total"
          />
        </IntlProvider>,
      </QueryClientProvider>,
    );

    const sections = [
      {
        className: '.learning-hours-over-time-chart-container',
        title: 'Learning Hours Over Time',
        subtitle: 'See audit and certificate track hours of learning over time.',
      },
      {
        className: '.top-10-courses-by-learning-hours-chart-container',
        title: 'Top 10 Courses by Learning Hours',
        subtitle: 'See the courses in which your learners spend the most time.',
      },
      {
        className: '.top-10-subjects-by-learning-hours-chart-container',
        title: 'Top 10 Subjects by Learning Hours',
        subtitle: 'See the subjects your learners are spending the most time in.',
      },
      {
        className: '.individual-engagements-datatable-container',
        title: 'Individual Engagements',
        subtitle: 'See the engagement levels of learners from your organization.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });

    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalled();

      expect(screen.getByText('Mocked LineChart')).toBeInTheDocument();
      const elements = screen.getAllByText('Mocked BarChart');
      expect(elements).toHaveLength(2);

      // ensure the correct number of rows are rendered (including header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockAnalyticsData.count + 1); // +1 for header row

      // validate header row
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      ['Email', 'Course Title', 'Activity Date', 'Course Subject', 'Learning Hours'].forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      // validate content of each data row
      mockAnalyticsData.results.forEach((user, index) => {
        const rowCells = within(rows[index + 1]).getAllByRole('cell'); // Skip header row
        expect(rowCells[0]).toHaveTextContent(user.email);
        expect(rowCells[1]).toHaveTextContent(user.course_title);
        expect(rowCells[2]).toHaveTextContent(user.activity_date);
        expect(rowCells[3]).toHaveTextContent(user.course_subject);
        expect(rowCells[4]).toHaveTextContent(user.learning_time_hours);
      });
    });
  });
  test('renders charts with correct loading messages', () => {
    jest.mock('../data/hooks', () => ({
      useEnterpriseAnalyticsTableData: jest.fn().mockReturnValue({
        isLoading: true,
        data: null,
        isError: false,
        isFetching: false,
        error: null,
      }),
    }));

    render(
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          <Engagements
            enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
            startDate="2021-01-01"
            endDate="2021-12-31"
            granularity="Daily"
            calculation="Total"
          />
        </IntlProvider>,
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading learning hours over time chart data')).toBeInTheDocument();
    expect(screen.getByText('Loading top 10 courses by learning hours chart data')).toBeInTheDocument();
    expect(screen.getByText('Loading top 10 subjects by learning hours chart data')).toBeInTheDocument();
  });
});
