/* eslint-disable import/no-extraneous-dependencies */
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

import { queryClient } from '../../test/testUtils';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import IndividualCompletionsTable from './IndividualCompletionsTable';

jest.spyOn(EnterpriseDataApiService, 'fetchAdminAnalyticsData');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockCompletionsData = {
  next: null,
  previous: null,
  count: 2,
  num_pages: 1,
  current_page: 1,
  results: [
    {
      email: 'learner1@example.com',
      courseTitle: 'Intro to React',
      courseSubject: 'Computer Science',
      passedDate: '2024-10-01',
    },
    {
      email: 'learner2@example.com',
      courseTitle: 'Advanced Python',
      courseSubject: 'Programming',
      passedDate: '2024-10-15',
    },
  ],
};

axiosMock.onAny().reply(200);
axios.get = jest.fn(() => Promise.resolve({ data: mockCompletionsData }));

const TEST_ENTERPRISE_ID = '33ce6562-95e0-4ecf-a2a7-7d407eb96f69';

describe('IndividualCompletionsTable Component', () => {
  test('renders correct title and subtitle', () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <IndividualCompletionsTable
              enterpriseId={TEST_ENTERPRISE_ID}
              startDate="2024-10-01"
              endDate="2024-10-31"
            />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    expect(screen.getByText('Individual Completions')).toBeInTheDocument();
    expect(screen.getByText('See the individual completions from your organization.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <IndividualCompletionsTable
              enterpriseId={TEST_ENTERPRISE_ID}
              startDate="2024-10-01"
              endDate="2024-10-31"
            />
          </IntlProvider>
        </QueryClientProvider>
      </Router>,
    );

    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchAdminAnalyticsData).toHaveBeenCalled();

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockCompletionsData.results.length + 1); // +1 for header

      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      expect(columnHeaders[0]).toHaveTextContent('Email');
      expect(columnHeaders[1]).toHaveTextContent('Course Title');
      expect(columnHeaders[2]).toHaveTextContent('Course Subject');
      expect(columnHeaders[3]).toHaveTextContent('Passed Date');

      mockCompletionsData.results.forEach((item, idx) => {
        const row = within(rows[idx + 1]).getAllByRole('cell');
        expect(row[0]).toHaveTextContent(item.email);
        expect(row[1]).toHaveTextContent(item.courseTitle);
        expect(row[2]).toHaveTextContent(item.courseSubject);
        expect(row[3]).toHaveTextContent(item.passedDate);
      });
    });
  });
});
