import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import PastWeekPassedLearnersTable from '.';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'completed-learners-week': {
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
          },
          {
            id: 5,
            passed_date: '2018-09-22T16:27:34.690065Z',
            course_title: 'Redux with ReactJS',
            course_key: 'edX/Redux_ReactJS',
            user_email: 'new@example.com',

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

const PastWeekPassedLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <PastWeekPassedLearnersTable
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('PastWeekPassedLearnersTable', () => {
  let wrapper;

  it('renders table correctly', () => {
    const tree = renderer
      .create((
        <PastWeekPassedLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders table with correct data', () => {
    const tableId = 'completed-learners-week';
    const columnTitles = ['Email', 'Course Title', 'Passed Date'];
    const rowsData = [
      [
        'awesome.me@example.com',
        'Dive into ReactJS',
        'September 23, 2018',
      ],
      [
        'new@example.com',
        'Redux with ReactJS',
        'September 22, 2018',
      ],
    ];

    wrapper = mount((
      <PastWeekPassedLearnersWrapper />
    ));

    // Verify that table has correct number of columns
    expect(wrapper.find(`.${tableId} thead th`).length).toEqual(3);

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
  });
});
