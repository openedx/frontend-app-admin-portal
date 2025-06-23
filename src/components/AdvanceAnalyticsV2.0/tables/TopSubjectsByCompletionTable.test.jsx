/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TopSubjectsByCompletionTable from './TopSubjectsByCompletionTable';
import * as utils from '../data/utils';

const mockTopSubjectsByCompletionData = [
  {
    courseSubject: 'computer-science',
    enrollType: 'audit',
    completionCount: 3000,
  },
  {
    courseSubject: 'computer-science',
    enrollType: 'certificate',
    completionCount: 25,
  },
];

const aggregatedMock = [
  {
    courseSubject: 'computer-science',
    completionCount: 3025,
  },
];

describe('TopSubjectsByCompletionTable Component', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  test('renders correct title and subtitle', () => {
    render(
      <IntlProvider locale="en">
        <TopSubjectsByCompletionTable
          isFetching={false}
          data={mockTopSubjectsByCompletionData}
          startDate="2021-01-01"
          endDate="2021-12-31"
          granularity="monthly"
          calculation="total"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Top 10 subjects by completion')).toBeInTheDocument();
    expect(screen.getByText('See the subjects in which your learners are most often achieving a passing grade.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <IntlProvider locale="en">
        <TopSubjectsByCompletionTable
          isFetching={false}
          data={mockTopSubjectsByCompletionData}
          startDate="2021-01-01"
          endDate="2021-12-31"
          granularity="monthly"
          calculation="total"
        />
      </IntlProvider>,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Subject');
    expect(headers[1]).toHaveTextContent('Completion');

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2);

      const rowCells = within(rows[1]).getAllByRole('cell');
      expect(rowCells[0]).toHaveTextContent('computer-science');
      expect(rowCells[1]).toHaveTextContent(3025);
    });
  });
});
