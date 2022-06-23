/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import Sidebar from './index';
import { SubsidyRequestsContext } from '../../components/subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../components/EnterpriseSubsidiesContext';

import { features } from '../../config';

import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
} from '../../data/constants/sidebar';

features.CODE_MANAGEMENT = true;

const mockStore = configureMockStore([thunk]);
const initialState = {
  sidebar: {
    isExpanded: false,
    isExpandedByToggle: false,
  },
  portalConfiguration: {
    enableCodeManagementScreen: true,
    enableSubscriptionManagementScreen: true,
    enableAnalyticsScreen: true,
  },
};

const initialSubsidyRequestsContextValue = {
  subsidyRequestsCounts: {
    subscriptionLicenses: null,
    couponCodes: null,
  },
};

const initialEnterpriseSubsidiesContextValue = {
  canManageLearnerCredit: true,
};

const SidebarWrapper = ({
  subsidyRequestsContextValue = initialSubsidyRequestsContextValue,
  enterpriseSubsidiesContextValue = initialEnterpriseSubsidiesContextValue,
  ...props
}) => (
  <MemoryRouter>
    <Provider store={props.store}>
      <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
        <SubsidyRequestsContext.Provider value={subsidyRequestsContextValue}>
          <Sidebar
            baseUrl="/test-enterprise-slug"
            {...props}
          />
        </SubsidyRequestsContext.Provider>
      </EnterpriseSubsidiesContext.Provider>
    </Provider>
  </MemoryRouter>
);

SidebarWrapper.defaultProps = {
  store: mockStore({
    ...initialState,
  }),
};

SidebarWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('<Sidebar />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount((
      <SidebarWrapper />
    ));
  });

  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SidebarWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when code management is hidden', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableCodeManagementScreen: false,
      },
    });

    const tree = renderer
      .create((
        <SidebarWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when expanded', () => {
    const store = mockStore({
      ...initialState,
      sidebar: {
        ...initialState.sidebar,
        isExpanded: true,
      },
    });

    const tree = renderer
      .create((
        <SidebarWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when expanded by toggle', () => {
    const store = mockStore({
      ...initialState,
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });

    const tree = renderer
      .create((
        <SidebarWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('calls onWidthChange callback', () => {
    it('on isMobile prop change', () => {
      const spy = jest.fn();
      wrapper = mount((
        <SidebarWrapper
          onWidthChange={spy}
        />
      ));
      wrapper.setProps({ isMobile: true });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('events', () => {
    let store;

    beforeEach(() => {
      store = wrapper.prop('store');
      store.clearActions();
    });

    it('expands on mouse over', () => {
      const expectedActions = [{
        type: EXPAND_SIDEBAR,
        payload: { usingToggle: false },
      }];

      wrapper.find('Sidebar').simulate('mouseover');
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('expands on focus', () => {
      const expectedActions = [{
        type: EXPAND_SIDEBAR,
        payload: { usingToggle: false },
      }];

      wrapper.find('Sidebar').simulate('focus');
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('collapses on mouseout', () => {
      store = mockStore({
        ...initialState,
        sidebar: {
          ...initialState.sidebar,
          isExpanded: true,
        },
      });

      wrapper = mount((
        <SidebarWrapper store={store} />
      ));

      const expectedActions = [{
        type: COLLAPSE_SIDEBAR,
        payload: { usingToggle: false },
      }];

      wrapper.find('Sidebar').simulate('mouseleave');
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('collapses on blur', () => {
      store = mockStore({
        ...initialState,
        sidebar: {
          ...initialState.sidebar,
          isExpanded: true,
        },
      });

      wrapper = mount((
        <SidebarWrapper store={store} />
      ));

      const expectedActions = [{
        type: COLLAPSE_SIDEBAR,
        payload: { usingToggle: false },
      }];

      wrapper.find('Sidebar').simulate('blur');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('renders correctly when subscriptionManagementScreen is false', () => {
    // should cause both subscription management and enrollment links to not be present
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: false,
      },
    });

    render(<SidebarWrapper store={store} />);
    const subscriptionManagementLink = screen.queryByRole('link', { name: 'Subscription Management' }, { exact: false });
    expect(subscriptionManagementLink).toBeNull();
  });

  it('renders correctly when subscriptionManagementScreen', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
      },
    });
    render(<SidebarWrapper store={store} />);
    const subscriptionManagementLink = screen.getByRole('link', { name: 'Subscription Management' }, { exact: false });
    expect(subscriptionManagementLink).toBeInTheDocument();
  });

  it('renders settings link if the settings page has visible tabs.', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enableLearnerPortal: true,
      },
    });

    features.SETTINGS_PAGE = true;

    render(<SidebarWrapper store={store} />);
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('hides settings link if the settings page has no visible tabs.', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enableLearnerPortal: false,
      },
    });

    features.SETTINGS_PAGE = true;

    render(<SidebarWrapper store={store} />);
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('renders manage learner credit link if the canManageLearnerCredit = true.', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enableLearnerPortal: true,
      },
    });

    render(<SidebarWrapper store={store} />);
    expect(screen.getByRole('link', { name: 'Learner Credit Management' })).toBeInTheDocument();
  });

  it('hides manage learner credit link if the canManageLearnerCredit = false.', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enableLearnerPortal: false,
      },
    });

    render(<SidebarWrapper
      store={store}
      enterpriseSubsidiesContextValue={{
        canManageLearnerCredit: false,
      }}
    />);
    expect(screen.queryByRole('link', { name: 'Learner Credit Management' })).not.toBeInTheDocument();
  });

  describe('notifications', () => {
    it('displays notification bubble when there are outstanding license requests', () => {
      const contextValue = { subsidyRequestsCounts: { subscriptionLicenses: 2 } };
      render(<SidebarWrapper subsidyRequestsContextValue={contextValue} />);
      expect(screen.getByRole('link', { name: 'Subscription Management has unread notifications' })).toBeInTheDocument();
    });
    it('does not display notification bubble when there are 0 outstanding license requests', () => {
      const contextValue = { subsidyRequestsCounts: { subscriptionLicenses: 0 } };
      render(<SidebarWrapper subsidyRequestsContextValue={contextValue} />);
      expect(screen.queryByRole('link', { name: 'Subscription Management has unread notifications' })).not.toBeInTheDocument();
    });
    it('displays notification bubble when there are outstanding coupon code requests', () => {
      const contextValue = { subsidyRequestsCounts: { couponCodes: 2 } };
      render(<SidebarWrapper subsidyRequestsContextValue={contextValue} />);
      expect(screen.getByRole('link', { name: 'Code Management has unread notifications' })).toBeInTheDocument();
    });
    it('does not display notification bubble when there are 0 outstanding coupon code requests', () => {
      const contextValue = { subsidyRequestsCounts: { couponCodes: 0 } };
      render(<SidebarWrapper subsidyRequestsContextValue={contextValue} />);
      expect(screen.queryByRole('link', { name: 'Code Management has unread notifications' })).not.toBeInTheDocument();
    });
  });
});
