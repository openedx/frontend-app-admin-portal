import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import RegisteredLearnersTable from '.';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
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

function RegisteredLearnersWrapper(props) {
  return (
    <MemoryRouter>
      <Provider store={store}>
        <RegisteredLearnersTable
          {...props}
        />
      </Provider>
    </MemoryRouter>
  );
}

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
