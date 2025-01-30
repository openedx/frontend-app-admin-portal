import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import CompletedLearnersTable from './CompletedLearnersTable';
import { useGenericTableData } from './data/hooks';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';

jest.mock('./data/hooks/useGenericTableData', () => (
  jest.fn().mockReturnValue({})
));

const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const CompletedLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <CompletedLearnersTable
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('CompletedLearnersTable', () => {
  it('renders empty state correctly', () => {
    useGenericTableData.mockReturnValue({
      isLoading: false,
      tableData: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchTableData: jest.fn(),
    });
    const tree = renderer
      .create((
        <CompletedLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
