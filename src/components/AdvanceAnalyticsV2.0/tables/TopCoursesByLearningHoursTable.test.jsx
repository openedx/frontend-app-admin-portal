/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TopCoursesByLearningHoursTable from './TopCoursesByLearningHoursTable';
import * as utils from '../data/utils';

const mockTopCoursesByLearningHoursTableData = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollType: 'audit',
    learningTimeHours: 7798,
  },
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollType: 'certificate',
    learningTimeHours: 2801,
  },
];

const aggregatedMock = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    learningTimeHours: 10599,
  },
];

describe('TopCoursesByLearningHoursTable Component', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  test('renders correct content', () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByLearningHoursTable
          isFetching={false}
          data={mockTopCoursesByLearningHoursTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Top 10 courses by learning hours')).toBeInTheDocument();
    expect(screen.getByText('See the most popular courses at your organization.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByLearningHoursTable
          isFetching={false}
          data={mockTopCoursesByLearningHoursTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Courses');
    expect(headers[1]).toHaveTextContent('Learning hours');

    await waitFor(() => {
      // ensure the correct number of rows are rendered (including header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1 + 1); // +1 for header row

      // validate header row
      const columns = [
        'Courses',
        'Learning hours',
      ];
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      columns.forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      const rowCells = within(rows[0 + 1]).getAllByRole('cell');
      expect(rowCells[0]).toHaveTextContent("HarvardX: CS50's Introduction to Computer Science");
      expect(rowCells[1]).toHaveTextContent(10599);
    });
  });
});
