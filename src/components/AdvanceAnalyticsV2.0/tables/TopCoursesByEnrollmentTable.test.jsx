/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TopCoursesByEnrollmentTable from './TopCoursesByEnrollmentTable';
import * as utils from '../data/utils';

const mockTopCoursesByEnrollmentTableData = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollType: 'audit',
    enrollmentCount: 1805,
  },
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollType: 'certificate',
    enrollmentCount: 804,
  },
];

const aggregatedMock = [
  {
    courseKey: 'HarvardX+CS50x',
    courseTitle: "HarvardX: CS50's Introduction to Computer Science",
    enrollmentCount: 2609,
  },
];

describe('TopCoursesByEnrollmentTable Component', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  test('renders correct content', () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByEnrollmentTable
          isFetching={false}
          data={mockTopCoursesByEnrollmentTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Top 10 courses by enrollment')).toBeInTheDocument();
    expect(screen.getByText('See the most popular courses at your organization.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <IntlProvider locale="en">
        <TopCoursesByEnrollmentTable
          isFetching={false}
          data={mockTopCoursesByEnrollmentTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Courses');
    expect(headers[1]).toHaveTextContent('Enrollment');

    await waitFor(() => {
      // ensure the correct number of rows are rendered (including header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1 + 1); // +1 for header row

      // validate header row
      const columns = [
        'Courses',
        'Enrollment',
      ];
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      columns.forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      const rowCells = within(rows[0 + 1]).getAllByRole('cell');
      expect(rowCells[0]).toHaveTextContent("HarvardX: CS50's Introduction to Computer Science");
      expect(rowCells[1]).toHaveTextContent(2609);
    });
  });
});
