/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TopSubjectsByEnrollmentTable from './TopSubjectsByEnrollmentTable';
import * as utils from '../data/utils';

const mockTopSubjectsByEnrollmentTableData = [
  {
    courseSubject: 'computer-science',
    enrollType: 'audit',
    enrollmentCount: 31449,
  },
  {
    courseSubject: 'computer-science',
    enrollType: '"certificate"',
    enrollmentCount: 7674,
  },
];

const aggregatedMock = [
  {
    courseSubject: 'computer-science',
    enrollmentCount: 39123,
  },
];

describe('TopSubjectsByEnrollmentTable Component', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  test('renders correct content', () => {
    render(
      <IntlProvider locale="en">
        <TopSubjectsByEnrollmentTable
          isFetching={false}
          data={mockTopSubjectsByEnrollmentTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Top 10 subjects by enrollment')).toBeInTheDocument();
    expect(screen.getByText('See the subjects your learners are spending the most time in.')).toBeInTheDocument();
  });

  test('renders the table rows with correct values', async () => {
    render(
      <IntlProvider locale="en">
        <TopSubjectsByEnrollmentTable
          isFetching={false}
          data={mockTopSubjectsByEnrollmentTableData}
          startDate="2021-01-01"
          endDate="2021-12-31"
        />
      </IntlProvider>,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Subjects');
    expect(headers[1]).toHaveTextContent('Enrollment');

    await waitFor(() => {
      // ensure the correct number of rows are rendered (including header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1 + 1); // +1 for header row

      // validate header row
      const columns = [
        'Subjects',
        'Enrollment',
      ];
      const columnHeaders = within(rows[0]).getAllByRole('columnheader');
      columns.forEach((column, index) => {
        expect(columnHeaders[index].textContent).toEqual(column);
      });

      const rowCells = within(rows[0 + 1]).getAllByRole('cell');
      expect(rowCells[0]).toHaveTextContent('computer-science');
      expect(rowCells[1]).toHaveTextContent(39123);
    });
  });
});
