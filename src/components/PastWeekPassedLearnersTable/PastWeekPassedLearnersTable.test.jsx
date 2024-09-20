import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import PastWeekPassedLearnersTable from '.';
import usePastWeekPassedLearners from './data/hooks/usePastWeekPassedLearners';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const mockUsePastWeekPassedLearners = {
  isLoading: false,
  pastWeekPassedLearners: {
    itemCount: 2,
    pageCount: 1,
    results: [
      {
        id: 1,
        passedDate: '2018-09-23T16:27:34.690065Z',
        courseTitle: 'Dive into ReactJS',
        courseKey: 'edX/ReactJS',
        userEmail: 'awesome.me@example.com',
      },
      {
        id: 5,
        passedDate: '2018-09-22T16:27:34.690065Z',
        courseTitle: 'Redux with ReactJS',
        courseKey: 'edX/Redux_ReactJS',
        userEmail: 'new@example.com',
      },
    ],
  },
  fetchPastWeekPassedLearners: jest.fn(),
};

jest.mock('./data/hooks/usePastWeekPassedLearners', () => (
  jest.fn().mockReturnValue({})
));

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
  beforeEach(() => {
    usePastWeekPassedLearners.mockReturnValue(mockUsePastWeekPassedLearners);
  });

  afterEach(() => jest.clearAllMocks());

  it('renders table correctly', () => {
    const tree = renderer
      .create((
        <PastWeekPassedLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders table with correct data', () => {
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

    const wrapper = mount((
      <PastWeekPassedLearnersWrapper />
    ));

    // Verify that table has correct number of columns
    expect(wrapper.find('[role="table"] thead th').length).toEqual(3);

    // Verify only expected columns are shown
    wrapper.find('[role="table"] thead th').forEach((column, index) => {
      expect(column.text()).toContain(columnTitles[index]);
    });

    // Verify that table has correct number of rows
    expect(wrapper.find('[role="table"] tbody tr').length).toEqual(2);

    // Verify each row in table has correct data
    wrapper.find('[role="table"] tbody tr').forEach((row, rowIndex) => {
      row.find('td').forEach((cell, colIndex) => {
        expect(cell.text()).toEqual(rowsData[rowIndex][colIndex]);
      });
    });
  });
});
