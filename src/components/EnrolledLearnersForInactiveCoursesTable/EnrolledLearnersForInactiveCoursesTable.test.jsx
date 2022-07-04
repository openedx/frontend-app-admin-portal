import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnrolledLearnersForInactiveCoursesTable from '.';
import * as tableUtils from '../../data/actions/table';

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
const enrolledLearnersForInactiveCoursesData = {
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
};
const enrolledLearnersForInactiveCoursesStore = mockStore(enrolledLearnersForInactiveCoursesData);

const EnrolledLearnersForInactiveCoursesEmptyTableWrapper = props => (
  <MemoryRouter>
    <Provider store={enrolledLearnersForInactiveCoursesEmptyStore}>
      <IntlProvider locale="en">
        <EnrolledLearnersForInactiveCoursesTable
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

const EnrolledLearnersForInactiveCoursesWrapper = props => (
  <MemoryRouter>
    <Provider store={enrolledLearnersForInactiveCoursesStore}>
      <IntlProvider locale="en">
        <EnrolledLearnersForInactiveCoursesTable
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('EnrolledLearnersForInactiveCoursesTable', () => {
  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <EnrolledLearnersForInactiveCoursesEmptyTableWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders enrolled learners for inactive courses table correctly', () => {
    const tree = renderer
      .create((
        <EnrolledLearnersForInactiveCoursesWrapper />
      ))
      .toJSON();
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

    const wrapper = mount((
      <EnrolledLearnersForInactiveCoursesWrapper />
    ));

    // Verify that table has correct number of columns
    expect(wrapper.find(`.${tableId} thead th`).length).toEqual(columnTitles.length);

    // Verify only expected columns are shown
    wrapper.find(`.${tableId} thead th`).forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    // Verify that table has correct number of rows
    expect(wrapper.find(`.${tableId} tbody tr`).length).toEqual(rowsData.length);

    // Verify each row in table has correct data
    wrapper.find(`.${tableId} tbody tr`).forEach((row, rowIndex) => {
      row.find('td').forEach((cell, colIndex) => {
        expect(cell.text()).toEqual(rowsData[rowIndex][colIndex]);
      });
    });
  });
  it('test sorting', () => {
    const tableId = 'enrolled-learners-inactive-courses';

    jest.spyOn(tableUtils, 'sortTable');

    const wrapper = mount((
      <EnrolledLearnersForInactiveCoursesWrapper />
    ));

    expect(tableUtils.sortTable).toHaveBeenCalledTimes(0);
    wrapper.find(`.${tableId} th`).first().simulate('click');
    expect(tableUtils.sortTable).toHaveBeenCalledTimes(1);
  });

  it('test pagination', () => {
    const tableId = 'enrolled-learners-inactive-courses';
    const storeData = JSON.parse(JSON.stringify(enrolledLearnersForInactiveCoursesData));

    storeData.table['enrolled-learners-inactive-courses'].data.num_pages = 2;
    storeData.table['enrolled-learners-inactive-courses'].data.next = '?page=2';

    jest.spyOn(tableUtils, 'paginateTable');

    const wrapper = mount((
      <MemoryRouter>
        <Provider store={mockStore(storeData)}>
          <IntlProvider locale="en">
            <EnrolledLearnersForInactiveCoursesTable />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    ));

    expect(tableUtils.paginateTable).toHaveBeenCalledTimes(1);
    wrapper.find(`.${tableId}`).find('button[aria-label="Next, Page 2"]').simulate('click');
    expect(tableUtils.paginateTable).toHaveBeenCalledTimes(2);
  });
});
