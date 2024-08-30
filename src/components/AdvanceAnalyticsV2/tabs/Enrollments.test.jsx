import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Enrollments from './Enrollments';
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

describe('Enrollments Component', () => {
  test('renders all sections with correct classes and content', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          <Enrollments />
        </IntlProvider>,
      </QueryClientProvider>,
    );

    const sections = [
      {
        className: '.enrollments-over-time-chart-container',
        title: 'Enrollments Over Time',
        subtitle: 'See audit and certificate track enrollments over time.',
      },
      {
        className: '.top-10-courses-by-enrollment-chart-container',
        title: 'Top 10 Courses by Enrollment',
        subtitle: 'See the most popular courses at your organization.',
      },
      {
        className: '.top-10-subjects-by-enrollment-chart-container',
        title: 'Top 10 Subjects by Enrollment',
        subtitle: 'See the most popular subjects at your organization.',
      },
      {
        className: '.individual-enrollments-datatable-container',
        title: 'Individual Enrollments',
        subtitle: 'See the individual enrollments from your organization.',
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
      const columns = ['Email', 'Course Title', 'Course Subject', 'Enroll Type', 'Enterprise Enrollment Date'];
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      columns.forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      // validate content of each data row
      mockAnalyticsData.results.forEach((user, index) => {
        const rowCells = within(rows[index + 1]).getAllByRole('cell'); // Skip header row
        expect(rowCells[0]).toHaveTextContent(user.email);
        expect(rowCells[1]).toHaveTextContent(user.course_title);
        expect(rowCells[2]).toHaveTextContent(user.course_subject);
        expect(rowCells[3]).toHaveTextContent(user.enroll_type);
        expect(rowCells[4]).toHaveTextContent(user.enterprise_enrollment_date);
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
          <Enrollments
            enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
            startDate="2021-01-01"
            endDate="2021-12-31"
            granularity="Daily"
            calculation="Total"
          />
        </IntlProvider>,
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading enrollments over time chart data')).toBeInTheDocument();
    expect(screen.getByText('Loading top courses by enrollments chart data')).toBeInTheDocument();
    expect(screen.getByText('Loading top subjects by enrollments chart data')).toBeInTheDocument();
  });
});
