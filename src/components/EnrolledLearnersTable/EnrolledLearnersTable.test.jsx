import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import EnrolledLearnersTable from '.';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
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
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrolledLearnersTable
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrolledLearnersTable', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<EnrolledLearnersWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <EnrolledLearnersWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
