import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import LearnerActivityTable from '.';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const learnerActivityEmptyStore = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'active-week': {
      data: {
        results: [],
        current_page: 1,
        num_pages: 1,
      },
      ordering: null,
      loading: false,
      error: null,
    },
  },
});

const tableMockData = {
  data: {
    count: 2,
    num_pages: 1,
    current_page: 1,
    results: [
      {
        id: 1,
        passed_date: '2018-09-23T16:27:34.690065Z',
        course_title: 'Dive into ReactJS',
        course_key: 'edX/ReactJS',
        user_email: 'awesome.me@example.com',
        course_list_price: '200',
        course_start_date: '2017-10-21T23:47:32.738Z',
        course_end_date: '2018-05-13T12:47:27.534Z',
        current_grade: '0.66',
        progress_status: 'Failed',
        last_activity_date: '2018-09-22T10:59:28.628Z',
      },
      {
        id: 5,
        passed_date: '2018-09-22T16:27:34.690065Z',
        course_title: 'Redux with ReactJS',
        course_key: 'edX/Redux_ReactJS',
        user_email: 'new@example.com',
        course_list_price: '200',
        course_start_date: '2017-10-21T23:47:32.738Z',
        course_end_date: '2018-05-13T12:47:27.534Z',
        current_grade: '0.80',
        progress_status: 'Passed',
        last_activity_date: '2018-09-25T10:59:28.628Z',
      },
    ],
    next: null,
    start: 0,
    previous: null,
  },
  ordering: null,
  loading: false,
  error: null,
};

const learnerActivityStore = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'active-week': tableMockData,
    'inactive-week': tableMockData,
    'inactive-month': tableMockData,
  },
});

const LearnerActivityEmptyTableWrapper = props => (
  <MemoryRouter>
    <Provider store={learnerActivityEmptyStore}>
      <LearnerActivityTable
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

const LearnerActivityTableWrapper = props => (
  <MemoryRouter>
    <Provider store={learnerActivityStore}>
      <LearnerActivityTable
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

const verifyLearnerActivityTableRendered = (tableId, activity, columnTitles, rowsData) => {
  const wrapper = mount((
    <LearnerActivityTableWrapper id={tableId} activity={activity} />
  ));
  // Verify that table has correct number of columns
  expect(wrapper.find(`.${tableId} thead th`).length).toEqual(columnTitles.length);

  // Verify only expected columns are shown
  wrapper.find(`.${tableId} thead th`).forEach((column, index) => {
    expect(column.text()).toContain(columnTitles[index]);
  });

  // Verify that table has correct number of rows
  expect(wrapper.find(`.${tableId} tbody tr`).length).toEqual(2);

  // Verify each row in table has correct data
  wrapper.find(`.${tableId} tbody tr`).forEach((row, rowIndex) => {
    row.find('td').forEach((cell, colIndex) => {
      expect(cell.text()).toEqual(rowsData[rowIndex][colIndex]);
    });
  });
};

describe('LearnerActivityTable', () => {
  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <LearnerActivityEmptyTableWrapper id="active-week" activity="active_past_week" />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders active learners table correctly', () => {
    const tree = renderer
      .create((
        <LearnerActivityTableWrapper id="active-week" activity="active_past_week" />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders inactive past week learners table correctly', () => {
    const tree = renderer
      .create((
        <LearnerActivityTableWrapper id="inactive-week" activity="inactive_past_week" />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders inactive past month learners table correctly', () => {
    const tree = renderer
      .create((
        <LearnerActivityTableWrapper id="inactive-month" activity="inactive_past_month" />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
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

  it('renders inactive past month learners table with correct data', () => {
    const tableId = 'inactive-month';
    const activity = 'inactive_past_month';
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
});
