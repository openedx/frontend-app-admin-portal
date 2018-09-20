import React from 'react';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import EnrolledLearnersTable from '.';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  table: {
    'enrolled-learners': {
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

const EnrolledLearnersWrapper = props => (
  <Provider store={store}>
    <EnrolledLearnersTable
      {...props}
    />
  </Provider>
);

describe('EnrolledLearnersTable', () => {
  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <EnrolledLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
