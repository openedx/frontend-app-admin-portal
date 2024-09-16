import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import Leaderboard from './Leaderboard';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockLeaderboardData = {
  next: null,
  previous: null,
  count: 3,
  num_pages: 1,
  current_page: 1,
  results: [
    {
      email: 'user100@example.com',
      daily_sessions: 74,
      learning_time_hours: 13.1,
      average_session_length: 1.8,
      course_completions: 3,
    },
    {
      email: 'user200@example.com',
      daily_sessions: 48,
      learning_time_hours: 131.9,
      average_session_length: 2.7,
      course_completions: 1,
    },
    {
      email: 'user300@example.com',
      daily_sessions: 92,
      learning_time_hours: 130,
      average_session_length: 1.4,
      course_completions: 3,
    },
  ],
};

axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockLeaderboardData }));

const TEST_ENTERPRISE_ID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('Leaderboard Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Leaderboard
              enterpriseId={TEST_ENTERPRISE_ID}
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>
      </Router>,
    );

    const sections = [
      {
        className: '.leaderboard-datatable-container',
        title: 'Leaderboard',
        subtitle: 'See the top learners by different measures of engagement. The results are defaulted to sort by learning hours. Download the full CSV below to sort by other metrics.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });
  });
  test('renders the table rows with correct values', async () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Leaderboard
              enterpriseId={TEST_ENTERPRISE_ID}
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>
      </Router>,
    );

    // validate the header row
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent('Email');
    expect(headers[1]).toHaveTextContent('Learning Hours');
    expect(headers[2]).toHaveTextContent('Daily Sessions');
    expect(headers[3]).toHaveTextContent('Average Session Length (Hours)');
    expect(headers[4]).toHaveTextContent('Course Completions');

    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalled();

      // ensure the correct number of rows are rendered (including header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3 + 1); // +1 for header row

      // validate header row
      const columns = [
        'Email',
        'Learning Hours',
        'Daily Sessions',
        'Average Session Length (Hours)',
        'Course Completions',
      ];
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      columns.forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      // validate content of each data row
      mockLeaderboardData.results.forEach((user, index) => {
        const rowCells = within(rows[index + 1]).getAllByRole('cell'); // Skip header row
        expect(rowCells[0]).toHaveTextContent(user.email);
        expect(rowCells[1]).toHaveTextContent(user.learning_time_hours);
        expect(rowCells[2]).toHaveTextContent(user.daily_sessions);
        expect(rowCells[3]).toHaveTextContent(user.average_session_length);
        expect(rowCells[4]).toHaveTextContent(user.course_completions);
      });
    });
  });
});
