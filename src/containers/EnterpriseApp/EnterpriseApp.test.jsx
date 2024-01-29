/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { breakpoints } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { axiosMock } from '../../setupTest';

import EnterpriseApp from './index';

import { TOGGLE_SIDEBAR_TOGGLE } from '../../data/constants/sidebar';

import { features } from '../../config';
import { EnterpriseSubsidiesContext } from '../../components/EnterpriseSubsidiesContext';
import { EnterpriseAppContext } from '../../components/EnterpriseApp/EnterpriseAppContextProvider';

const defaultEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: null,
    isLoading: false,
    fetchError: null,
  },
};

const defaultEnterpriseSubsidiesContextValue = {
  canManageLearnerCredit: true,
};

const EnterpriseAppContextProvider = ({
  initialEnterpriseAppContextValue = defaultEnterpriseAppContextValue,
  initialEnterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  children,
}) => (
  <EnterpriseAppContext.Provider value={initialEnterpriseAppContextValue}>
    <EnterpriseSubsidiesContext.Provider value={initialEnterpriseSubsidiesContextValue}>
      {children}
    </EnterpriseSubsidiesContext.Provider>
  </EnterpriseAppContext.Provider>
);

jest.mock('../../components/EnterpriseApp/EnterpriseAppContextProvider', () => ({
  __esModule: true,
  ...jest.requireActual('../../components/EnterpriseApp/EnterpriseAppContextProvider'),

  default: ({ children }) => <EnterpriseAppContextProvider>{children}</EnterpriseAppContextProvider>,
}));

jest.mock('../Sidebar', () => ({
  __esModule: true,

  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('@edx/paragon', () => ({
  __esModule: true,
  ...jest.requireActual('@edx/paragon'),
  Skeleton: () => <div data-testid="skeleton" />,
}));

jest.mock('../../components/ProductTours/ProductTours', () => function ProductTours() {
  return null;
});

features.CODE_MANAGEMENT = true;

getAuthenticatedUser.mockReturnValue({
  isActive: true,
  email: 'foo@bar.com',
  roles: ['enterprise_admin:*'],
  username: 'foo',
});

const mockStore = configureMockStore([thunk]);

const initialState = {
  dashboardAnalytics: {},
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise-slug',
    enterpriseName: 'test-enterpris',
    enableCodeManagementScreen: true,
    enableSubscriptionManagementScreen: true,
    enableAnalyticsScreen: true,
    loading: false,
  },
  csv: {},
  table: {
    'enterprise-list': {},
  },
  sidebar: {
    isExpanded: false,
    isExpandedByToggle: false,
  },
  dashboardInsights: {},
};

const EnterpriseAppWrapper = ({ store, initialEntries, ...props }) => (
  <MemoryRouter initialEntries={initialEntries || ['/test-enterprise-slug/admin/learners']}>
    <Provider store={store}>
      <IntlProvider locale="en">
        <Routes>
          <Route
            path="/:enterpriseSlug/*"
            element={<EnterpriseApp {...props} />}
          />
        </Routes>
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

EnterpriseAppWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

EnterpriseAppWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('<EnterpriseApp />', () => {
  afterEach(() => {
    axiosMock.reset();
  });
  it('renders not found page correctly', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        enterpriseId: null,
      },
    });
    render((
      <EnterpriseAppWrapper
        initialEntries={['/foo/bar']}
        store={store}
      />
    ));
    expect(screen.getAllByTestId('not-found-page').length).toEqual(1);
    expect(screen.getByTestId('not-found-error').textContent).toContain(404);
  });

  it('renders the load page correctly', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        loading: true,
      },
    });

    render((
      <EnterpriseAppWrapper store={store} />
    ));
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
  });

  it('renders error page correctly', () => {
    const err = 'test error';
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        error: Error(err),
      },
    });

    render((
      <EnterpriseAppWrapper store={store} />
    ));
    expect(screen.getByText(err)).toBeTruthy();
  });
  describe('location changes', () => {
    beforeEach(() => {
      // Avoid `attachTo: document.body` Warning
      const div = document.createElement('div');
      div.setAttribute('id', 'container');
      document.body.appendChild(div);
    });
    afterEach(() => {
      const div = document.getElementById('container');
      if (div) {
        document.body.removeChild(div);
      }
    });
    it.skip('handles location change properly', () => {
      // There is some logic where we collapse the sidebar on menu click on mobile
      // so we test that here as well. Note that we need to set the window width
      // to mobile first.
      const initialWidth = global.innerWidth;
      global.innerWidth = breakpoints.small.minWidth;

      const store = mockStore({
        ...initialState,
        sidebar: {
          ...initialState.sidebar,
          isExpandedByToggle: true,
        },
      });

      const wrapper = render(
        <EnterpriseAppWrapper store={store} />,
        { attachTo: document.getElementById('container') },
      );

      wrapper.rerender(
        <EnterpriseAppWrapper store={store} location={{ pathname: '/test-enterprise-slug/admin/codes' }} />,
        { attachTo: document.getElementById('container') },
      );

      // ensure focus is set on content wrapper
      expect(document.activeElement.className).toEqual('content-wrapper');
      global.innerWidth = initialWidth;
    });
  });

  it('toggles sidebar toggle on componentWillUnmount', () => {
    const store = mockStore({
      ...initialState,
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });

    const wrapper = render((
      <EnterpriseAppWrapper
        store={store}
      />
    ));

    // clear existing actions
    store.clearActions();

    // unmount component to trigger componentWillUnmount lifecycle method
    wrapper.unmount();

    // ensure the TOGGLE_SIDEBAR_TOGGLE action is dispatched
    const actions = store.getActions().filter(action => action.type === TOGGLE_SIDEBAR_TOGGLE);
    expect(actions).toHaveLength(1);
  });
});
