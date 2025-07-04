/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import LeaderboardTable from './LeaderboardTable';
import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockLeaderboardTableData = {
  next: null,
  previous: null,
  count: 3,
  num_pages: 1,
  current_page: 1,
  results: [
    {
      email: 'user100@example.com',
      session_count: 74,
      learning_time_hours: 13.1,
      average_session_length: 1.8,
      course_completion_count: 3,
    },
    {
      email: 'user200@example.com',
      session_count: 48,
      learning_time_hours: 131.9,
      average_session_length: 2.7,
      course_completion_count: 1,
    },
    {
      email: 'user300@example.com',
      session_count: 92,
      learning_time_hours: 130,
      average_session_length: 1.4,
      course_completion_count: 3,
    },
  ],
};

axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockLeaderboardTableData }));

const TEST_ENTERPRISE_ID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('LeaderboardTable Component', () => {
  test('renders correct content', () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <LeaderboardTable
              enterpriseId={TEST_ENTERPRISE_ID}
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>
      </Router>,
    );

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText(/Explore the top learners ranked by engagement metrics.*Only learners who have passed the course.*are included\./s))
      .toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <LeaderboardTable
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
      mockLeaderboardTableData.results.forEach((user, index) => {
        const rowCells = within(rows[index + 1]).getAllByRole('cell'); // Skip header row
        expect(rowCells[0]).toHaveTextContent(user.email);
        expect(rowCells[1]).toHaveTextContent(user.learning_time_hours);
        expect(rowCells[2]).toHaveTextContent(user.session_count);
        expect(rowCells[3]).toHaveTextContent(user.average_session_length);
        expect(rowCells[4]).toHaveTextContent(user.course_completion_count);
      });
    });
  });
});
