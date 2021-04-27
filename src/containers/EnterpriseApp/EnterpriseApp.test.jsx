import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { breakpoints } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import Skeleton from 'react-loading-skeleton';
import { axiosMock } from '../../setupTest';

import EnterpriseApp from './index';

import { TOGGLE_SIDEBAR_TOGGLE } from '../../data/constants/sidebar';

import { features } from '../../config';
import NotFoundPage from '../../components/NotFoundPage';

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
};

// eslint-disable-next-line react/prop-types
const EnterpriseAppWrapper = ({ store, initialEntries, ...props }) => (
  <MemoryRouter initialEntries={initialEntries || ['/test-enterprise-slug/admin/learners']}>
    <Provider store={store}>
      <EnterpriseApp
        match={{
          url: '/foo/bar',
          params: {
            enterpriseSlug: 'foo',
          },
        }}
        location={{
          pathname: '/test-enterprise-slug/admin/learners',
        }}
        history={{
          replace: () => {},
        }}
        {...props}
        portalConfiguration={{
          enterpriseId: null,
        }}
      />
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
    const wrapper = mount((
      <EnterpriseAppWrapper
        initialEntries={[{ pathname: '/foo/bar' }]}
        store={store}
        match={{
          url: '/foo',
          path: '/:enterpriseSlug',
          params: { enterpriseSlug: 'foo' },
        }}
      />
    ));
    expect(wrapper.find(NotFoundPage).length).toEqual(1);
    expect(wrapper.text()).toContain(404);
  });

  it('renders the load page correctly', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration, loading: true,
      },
    });

    const wrapper = mount((
      <EnterpriseAppWrapper store={store} />
    ));
    expect(wrapper.find(Skeleton)).toHaveLength(2);
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

    const wrapper = mount((
      <EnterpriseAppWrapper store={store} />
    ));
    expect(wrapper.text()).toContain(err);
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

      const wrapper = mount(
        <EnterpriseAppWrapper store={store} />,
        { attachTo: document.getElementById('container') },
      );

      wrapper.setProps({
        location: {
          pathname: '/test-enterprise-slug/admin/codes',
        },
      });

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

    const wrapper = mount((
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
