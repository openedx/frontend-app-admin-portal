import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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

    const { container } = render((
      <PastWeekPassedLearnersWrapper />
    ));

    // Verify that table has correct number of columns
    expect(container.querySelector(`.${tableId} thead th`)).toBeInTheDocument();

    // Verify only expected columns are shown
    container.querySelectorAll(`.${tableId} thead th`).forEach((column, index) => {
      expect(column.textContent).toContain(columnTitles[index]);
    });

    // Verify that table has correct number of rows
    expect(container.querySelectorAll(`.${tableId} tbody tr`).length).toEqual(2);

    // Verify each row in table has correct data
    container.querySelectorAll(`.${tableId} tbody tr`).forEach((row, rowIndex) => {
      row.querySelectorAll('td').forEach((cell, colIndex) => {
        expect(cell.textContent).toContain(rowsData[rowIndex][colIndex]);
      });
    });
  });
});
