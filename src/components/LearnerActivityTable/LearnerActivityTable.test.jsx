import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import LearnerActivityTable from '.';
import usePaginatedTableData from '../../hooks/usePaginatedTableData';
import { mockUseCourseEnrollments, mockEmptyCourseEnrollmentsData } from './data/tests/constants';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);

jest.mock('../../hooks/usePaginatedTableData', () => jest.fn());

const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const LearnerActivityTableWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <LearnerActivityTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

const verifyLearnerActivityTableRendered = (tableId, activity, columnTitles, rowsData) => {
  const wrapper = mount(<LearnerActivityTableWrapper id={tableId} activity={activity} />);
  const table = wrapper.find('[role="table"]');
  const headerColumns = table.find('thead th');
  const tableRows = table.find('tbody tr');

  expect(headerColumns).toHaveLength(columnTitles.length);

  headerColumns.forEach((column, index) => {
    expect(column.text()).toContain(columnTitles[index]);
  });

  expect(tableRows).toHaveLength(rowsData.length);

  tableRows.forEach((row, rowIndex) => {
    const cells = row.find('td');
    cells.forEach((cell, colIndex) => {
      expect(cell.text()).toEqual(rowsData[rowIndex][colIndex]);
    });
  });
};

describe('LearnerActivityTable', () => {
  beforeEach(() => {
    usePaginatedTableData.mockReturnValue(mockUseCourseEnrollments);
  });

  afterEach(() => jest.clearAllMocks());

  it('renders empty table correctly', () => {
    usePaginatedTableData.mockReturnValue(mockEmptyCourseEnrollmentsData);

    const wrapper = mount(
      <LearnerActivityTableWrapper id="active-week" activity="active_past_week" />,
    );

    expect(wrapper.find('[role="table"]').exists()).toBe(true);
    expect(wrapper.find('tbody tr').length).toBe(0);
  });

  it('renders active learners table correctly', () => {
    const tableId = 'active-week';
    const activity = 'active_past_week';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Passed Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];

    const wrapper = mount(<LearnerActivityTableWrapper id={tableId} activity={activity} />);
    const table = wrapper.find('[role="table"]');
    const headerColumns = table.find('thead th');

    expect(table.exists()).toBe(true);
    expect(headerColumns).toHaveLength(columnTitles.length);
    headerColumns.forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    expect(wrapper.find('tbody tr').length).toBeGreaterThan(0);
  });

  it('renders inactive past week learners table correctly', () => {
    const tableId = 'inactive-week';
    const activity = 'inactive_past_week';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];

    const wrapper = mount(<LearnerActivityTableWrapper id={tableId} activity={activity} />);
    const table = wrapper.find('[role="table"]');
    const headerColumns = table.find('thead th');

    expect(table.exists()).toBe(true);
    expect(headerColumns).toHaveLength(columnTitles.length);
    headerColumns.forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    const columnHeaders = headerColumns.map(col => col.text());
    expect(columnHeaders.includes('Passed Date')).toBe(false);
    expect(wrapper.find('tbody tr').length).toBeGreaterThan(0);
  });

  it('renders inactive past month learners table correctly', () => {
    const tableId = 'inactive-month';
    const activity = 'inactive_past_month';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];

    const wrapper = mount(<LearnerActivityTableWrapper id={tableId} activity={activity} />);
    const table = wrapper.find('[role="table"]');
    const headerColumns = table.find('thead th');

    expect(table.exists()).toBe(true);
    expect(headerColumns).toHaveLength(columnTitles.length);
    headerColumns.forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    const columnHeaders = headerColumns.map(col => col.text());
    expect(columnHeaders.includes('Passed Date')).toBe(false);
    expect(wrapper.find('tbody tr').length).toBeGreaterThan(0);
  });

  it('renders active learners table with correct data', () => {
    const tableId = 'active-week';
    const activity = 'active_past_week';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Passed Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];
    const rowsData = [
      [
        'awesome.me@example.com',
        'Dive into ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        'September 23, 2018',
        '66%',
        'Failed',
        'September 22, 2018',
      ],
      [
        'new@example.com',
        'Redux with ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        'September 22, 2018',
        '80%',
        'Passed',
        'September 25, 2018',
      ],
    ];

    verifyLearnerActivityTableRendered(tableId, activity, columnTitles, rowsData);
  });

  it('renders inactive past week learners table with correct data', () => {
    const tableId = 'inactive-week';
    const activity = 'inactive_past_week';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];
    const rowsData = [
      [
        'awesome.me@example.com',
        'Dive into ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        '66%',
        'Failed',
        'September 22, 2018',
      ],
      [
        'new@example.com',
        'Redux with ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        '80%',
        'Passed',
        'September 25, 2018',
      ],
    ];

    verifyLearnerActivityTableRendered(tableId, activity, columnTitles, rowsData);
  });

  it('renders inactive past month learners table with correct data', () => {
    const tableId = 'inactive-month';
    const activity = 'inactive_past_month';
    const columnTitles = [
      'Email',
      'Course Title',
      'Course Price',
      'Start Date',
      'End Date',
      'Current Grade',
      'Progress Status',
      'Last Activity Date',
    ];
    const rowsData = [
      [
        'awesome.me@example.com',
        'Dive into ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        '66%',
        'Failed',
        'September 22, 2018',
      ],
      [
        'new@example.com',
        'Redux with ReactJS',
        '$200',
        'October 21, 2017',
        'May 13, 2018',
        '80%',
        'Passed',
        'September 25, 2018',
      ],
    ];

    verifyLearnerActivityTableRendered(tableId, activity, columnTitles, rowsData);
  });
});
