import React from 'react';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import RegisteredLearnersTable from '.';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  table: {
    'registered-unenrolled-learners': {
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

const RegisteredLearnersWrapper = props => (
  <Provider store={store}>
    <RegisteredLearnersTable
      {...props}
    />
  </Provider>
);

describe('RegisteredLearnersTable', () => {
  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <RegisteredLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
