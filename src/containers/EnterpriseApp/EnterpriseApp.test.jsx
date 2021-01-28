import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { breakpoints } from '@edx/paragon';
import { axiosMock } from '../../setupTest';

import EnterpriseApp from './index';

import { TOGGLE_SIDEBAR_TOGGLE } from '../../data/constants/sidebar';

import { features } from '../../config';

features.CODE_MANAGEMENT = true;

const mockStore = configureMockStore([thunk]);
const initialState = {
  authentication: {
    roles: ['enterprise_admin:*'],
  },
  dashboardAnalytics: {},
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enableCodeManagementScreen: true,
    enableSubscriptionManagementScreen: true,
    enableAnalyticsScreen: true,
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
          url: '/test-enterprise-slug',
          params: {
            enterpriseSlug: 'test-enterprise-slug',
          },
        }}
        location={{
          pathname: '/test-enterprise-slug/admin/learners',
        }}
        history={{
          replace: () => {},
        }}
        {...props}
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
    const tree = renderer
      .create((
        <EnterpriseAppWrapper
          initialEntries={['/']}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders error page correctly', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        error: Error('test error'),
      },
    });

    const tree = renderer
      .create((
        <EnterpriseAppWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
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
        initialEntries: ['/test-enterprise-slug/admin/codes'],
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
