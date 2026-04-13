import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import CompletedLearnersTable from '.';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'completed-learners': {
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
  it('has no accessibility violations', async () => {
    const { container } = render(<CompletedLearnersWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <CompletedLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
