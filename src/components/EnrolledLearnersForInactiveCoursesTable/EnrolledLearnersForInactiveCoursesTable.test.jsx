import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import EnrolledLearnersForInactiveCoursesTable from '.';
import useEnrolledLearnersForInactiveCourses from './data/hooks/useEnrolledLearnersForInactiveCourses';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);

jest.mock('./data/hooks/useEnrolledLearnersForInactiveCourses', () => (
  jest.fn().mockReturnValue({})
));

const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const mockUseEnrolledLearnersForInactiveCourses = {
  isLoading: false,
  enrolledLearnersForInactiveCourses: {
    itemCount: 3,
    pageCount: 1,
    results: [
      {
        id: 1,
        enterpriseId: '72416e52-8c77-4860-9584-15e5b06220fb',
        lmsUserId: 11,
        enterpriseUserId: 222,
        enterpriseSsoUid: 'harry',
        userAccountCreationTimestamp: '2015-02-12T23:14:35Z',
        userEmail: 'test_user_1@example.com',
        userUsername: 'test_user_1',
        userCountryCode: 'US',
        lastActivityDate: '2017-06-23',
        enrollmentCount: 2,
        courseCompletionCount: 1,
      },
      {
        id: 1,
        enterpriseId: '72416e52-8c77-4860-9584-15e5b06220fb',
        lmsUserId: 22,
        enterpriseUserId: 333,
        enterpriseSsoUid: 'harry',
        userAccountCreationTimestamp: '2016-05-12T22:14:36Z',
        userEmail: 'test_user_2@example.com',
        userUsername: 'test_user_2',
        userCountryCode: 'US',
        lastActivityDate: '2018-01-15',
        enrollmentCount: 5,
        courseCompletionCount: 5,
      },
      {
        id: 1,
        enterpriseId: '72416e52-8c77-4860-9584-15e5b06220fb',
        lmsUserId: 33,
        enterpriseUserId: 444,
        enterpriseSsoUid: 'harry',
        userAccountCreationTimestamp: '2017-12-12T18:10:15Z',
        userEmail: 'test_user_3@example.com',
        userUsername: 'test_user_3',
        userCountryCode: 'US',
        lastActivityDate: '2017-11-18',
        enrollmentCount: 6,
        courseCompletionCount: 4,
      },
    ],
  },
  fetchEnrolledLearnersForInactiveCourses: jest.fn(),
};

const EnrolledLearnersForInactiveCoursesWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrolledLearnersForInactiveCoursesTable
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrolledLearnersForInactiveCoursesTable', () => {
  it('renders empty state correctly', () => {
    useEnrolledLearnersForInactiveCourses.mockReturnValueOnce({
      ...mockUseEnrolledLearnersForInactiveCourses,
      enrolledLearnersForInactiveCourses: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
    });
    const tree = renderer
      .create((
        <EnrolledLearnersForInactiveCoursesWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders enrolled learners for inactive courses table correctly', () => {
    useEnrolledLearnersForInactiveCourses.mockReturnValueOnce(
      mockUseEnrolledLearnersForInactiveCourses,
    );

    const tree = renderer
      .create((
        <EnrolledLearnersForInactiveCoursesWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders enrolled learners for inactive courses table with correct data', () => {
    useEnrolledLearnersForInactiveCourses.mockReturnValueOnce(
      mockUseEnrolledLearnersForInactiveCourses,
    );

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
    expect(wrapper.find('[role="table"] thead th').length).toEqual(columnTitles.length);

    // Verify only expected columns are shown
    wrapper.find('[role="table"] thead th').forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    // Verify that table has correct number of rows
    expect(wrapper.find('[role="table"] tbody tr').length).toEqual(rowsData.length);

    // Verify each row in table has correct data
    wrapper.find('[role="table"] tbody tr').forEach((row, rowIndex) => {
      row.find('td').forEach((cell, colIndex) => {
        expect(cell.text()).toEqual(rowsData[rowIndex][colIndex]);
      });
    });
  });
});
