import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import EnrolledLearnersForInactiveCoursesTable from '.';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const enrolledLearnersForInactiveCoursesEmptyStore = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'enrolled-learners-inactive-courses': {
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
const enrolledLearnersForInactiveCoursesStore = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'enrolled-learners-inactive-courses': {
      data: {
        count: 3,
        num_pages: 1,
        current_page: 1,
        results: [
          {
            id: 1,
            enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
            lms_user_id: 11,
            enterprise_user_id: 222,
            enterprise_sso_uid: 'harry',
            user_account_creation_timestamp: '2015-02-12T23:14:35Z',
            user_email: 'test_user_1@example.com',
            user_username: 'test_user_1',
            user_country_code: 'US',
            last_activity_date: '2017-06-23',
            enrollment_count: 2,
            course_completion_count: 1,
          },
          {
            id: 1,
            enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
            lms_user_id: 22,
            enterprise_user_id: 333,
            enterprise_sso_uid: 'harry',
            user_account_creation_timestamp: '2016-05-12T22:14:36Z',
            user_email: 'test_user_2@example.com',
            user_username: 'test_user_2',
            user_country_code: 'US',
            last_activity_date: '2018-01-15',
            enrollment_count: 5,
            course_completion_count: 5,
          },
          {
            id: 1,
            enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
            lms_user_id: 33,
            enterprise_user_id: 444,
            enterprise_sso_uid: 'harry',
            user_account_creation_timestamp: '2017-12-12T18:10:15Z',
            user_email: 'test_user_3@example.com',
            user_username: 'test_user_3',
            user_country_code: 'US',
            last_activity_date: '2017-11-18',
            enrollment_count: 6,
            course_completion_count: 4,
          },
        ],
        next: null,
        start: 0,
        previous: null,
      },
      ordering: null,
      loading: false,
      error: null,
    },
  },
});

const EnrolledLearnersForInactiveCoursesEmptyTableWrapper = props => (
  <MemoryRouter>
    <Provider store={enrolledLearnersForInactiveCoursesEmptyStore}>
      <EnrolledLearnersForInactiveCoursesTable
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

const EnrolledLearnersForInactiveCoursesWrapper = props => (
  <MemoryRouter>
    <Provider store={enrolledLearnersForInactiveCoursesStore}>
      <EnrolledLearnersForInactiveCoursesTable
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

describe('EnrolledLearnersForInactiveCoursesTable', () => {
  it('renders empty state correctly', () => {
    const { container: tree } = render(
      <EnrolledLearnersForInactiveCoursesEmptyTableWrapper />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders enrolled learners for inactive courses table correctly', () => {
    const { container: tree } = render(
      <EnrolledLearnersForInactiveCoursesWrapper />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders enrolled learners for inactive courses table with correct data', () => {
    const tableId = 'enrolled-learners-inactive-courses';
    const columnTitles = [
      'Email', 'Total Course Enrollment Count', 'Total Completed Courses Count', 'Last Activity Date',
    ];
    const rowsData = [
      [
        'test_user_1@example.com',
        '2',
        '1',
        'June 23, 2017',
      ],
      [
        'test_user_2@example.com',
        '5',
        '5',
        'January 15, 2018',
      ],
      [
        'test_user_3@example.com',
        '6',
        '4',
        'November 18, 2017',
      ],
    ];

    const wrapper = render((
      <EnrolledLearnersForInactiveCoursesWrapper />
    ));

    // Verify that table has correct number of columns
    expect(wrapper.container.querySelectorAll(`.${tableId} thead th`).length).toEqual(columnTitles.length);

    // Verify only expected columns are shown
    wrapper.container.querySelectorAll(`.${tableId} thead th`).forEach((column, index) => {
      expect(column.textContent).toContain(columnTitles[index]);
    });

    // Verify that table has correct number of rows
    expect(wrapper.container.querySelectorAll(`.${tableId} tbody tr`).length).toEqual(rowsData.length);

    // Verify each row in table has correct data
    wrapper.container.querySelectorAll(`.${tableId} tbody tr`).forEach((row, rowIndex) => {
      row.querySelectorAll('td').forEach((cell, colIndex) => {
        expect(cell.textContent).toEqual(rowsData[rowIndex][colIndex]);
      });
    });
  });
});
