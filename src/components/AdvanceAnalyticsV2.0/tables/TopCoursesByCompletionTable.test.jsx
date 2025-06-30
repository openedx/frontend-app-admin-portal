/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TopCoursesByCompletionTable from './TopCoursesByCompletionTable';
import * as utils from '../data/utils';

const mockTopCoursesByCompletionData = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollType: 'audit',
    completionCount: 804,
  },
  {
    courseKey: 'MITx+6.00.1x',
    courseTitle: 'MITx: Introduction to Computer Science and Programming',
    enrollType: 'certificate',
    completionCount: 10,
  },
];

const aggregatedMock = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    completionCount: 814,
  },
];

describe('TopCoursesByCompletionTable Component', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  test('renders correct title and subtitle', () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByCompletionTable
          isFetching={false}
          data={mockTopCoursesByCompletionData}
          startDate="2021-01-01"
          endDate="2021-12-31"
          granularity="monthly"
          calculation="total"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Top 10 courses by completion')).toBeInTheDocument();
    expect(screen.getByText('See the courses in which your learners are most often achieving a passing grade.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByCompletionTable
          isFetching={false}
          data={mockTopCoursesByCompletionData}
          startDate="2021-01-01"
          endDate="2021-12-31"
          granularity="monthly"
          calculation="total"
        />
      </IntlProvider>,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Courses');
    expect(headers[1]).toHaveTextContent('Completion');

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2);

      const row1Cells = within(rows[1]).getAllByRole('cell');
      expect(row1Cells[0]).toHaveTextContent("HarvardX: CS50's Introduction to Computer Science");
      expect(row1Cells[1]).toHaveTextContent(814);
    });
  });
});
