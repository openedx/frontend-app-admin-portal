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
import { getConfig } from '@edx/frontend-platform/config';

import Sidebar from './index';
import { SubsidyRequestsContext } from '../../components/subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../components/EnterpriseSubsidiesContext';
import { EnterpriseAppContext } from '../../components/EnterpriseApp/EnterpriseAppContextProvider';
import LmsApiService from '../../data/services/LmsApiService';
import { features } from '../../config';

import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
} from '../../data/constants/sidebar';

features.CODE_MANAGEMENT = true;

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    FEATURE_CONTENT_HIGHLIGHTS: false,
  })),
}));

jest.mock('../../data/services/LmsApiService');

const mockStore = configureMockStore([thunk]);
const initialState = {
  sidebar: {
    isExpanded: false,
    isExpandedByToggle: false,
  },
  portalConfiguration: {
    enableLearnerPortal: true,
    enableCodeManagementScreen: true,
    enableSubscriptionManagementScreen: true,
    enableAnalyticsScreen: true,
    enableReportingConfigScreenLink: true,
    enterpriseFeatures: {
      enterpriseGroupsV1: false,
    },
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      isHighlightFeatureActive: true,
    },
    isLoading: false,
    fetchError: null,
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
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  subsidyRequestsContextValue = initialSubsidyRequestsContextValue,
  enterpriseSubsidiesContextValue = initialEnterpriseSubsidiesContextValue,
  ...props
}) => (
  <MemoryRouter>
    <Provider store={props.store}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <SubsidyRequestsContext.Provider value={subsidyRequestsContextValue}>
            <Sidebar
              baseUrl="/test-enterprise-slug"
              {...props}
            />
          </SubsidyRequestsContext.Provider>
        </EnterpriseSubsidiesContext.Provider>
      </EnterpriseAppContext.Provider>
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
        enterpriseFeatures: {
          enterpriseGroupsV1: false,
        },
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
    // should cause subscription management to not be present
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: false,
      },
    });

    render(<SidebarWrapper store={store} />);
    const subscriptionManagementLink = screen.queryByRole('link', { name: 'Subscription Management' });
    expect(subscriptionManagementLink).toBeNull();
  });

  it('renders correctly when subscriptionManagementScreen is enabled', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
      },
    });
    render(<SidebarWrapper store={store} />);
    const subscriptionManagementLink = screen.getByRole('link', { name: 'Subscription Management' });
    expect(subscriptionManagementLink).toBeInTheDocument();
    expect(subscriptionManagementLink).toHaveAttribute('href', '/test-enterprise-slug/admin/subscriptions');
  });

  it('renders correctly when enableReportingConfigScreen is false', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableReportingConfigScreen: false,
      },
    });
    features.REPORTING_CONFIGURATIONS = true;
    render(<SidebarWrapper store={store} />);
    const enableReportingConfigScreenLink = screen.queryByRole('link', { name: 'Reporting Configurations' });
    expect(enableReportingConfigScreenLink).toBeNull();
  });

  it('renders correctly when enableReportingConfigScreen is enabled', async () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
      },
      portalConfiguration: {
        enableReportingConfigScreen: true,
      },
    });
    features.REPORTING_CONFIGURATIONS = true;
    render(<SidebarWrapper store={store} enableReportingConfigScreen />);
    const enableReportingConfigScreenLink = screen.getByRole('link', { name: 'Reporting Configurations' });
    expect(enableReportingConfigScreenLink).toBeInTheDocument();
    expect(enableReportingConfigScreenLink).toHaveAttribute('href', '/test-enterprise-slug/admin/reporting');
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
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/test-enterprise-slug/admin/settings');
  });

  it('renders manage learner credit link if the canManageLearnerCredit = true.', () => {
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enableLearnerPortal: true,
      },
    });

    render(<SidebarWrapper store={store} />);
    const enableLearnerCreditLink = screen.getByRole('link', { name: 'Learner Credit Management' });
    expect(enableLearnerCreditLink).toBeInTheDocument();
    expect(enableLearnerCreditLink).toHaveAttribute('href', '/test-enterprise-slug/admin/learner-credit');
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

  it.each([
    [
      {
        highlightsFeatureFlag: true,
        curationFeatureFlag: true,
      },
      true,
    ],
    [
      {
        highlightsFeatureFlag: false,
        curationFeatureFlag: true,
      },
      false,
    ],
    [
      {
        highlightsFeatureFlag: true,
        curationFeatureFlag: false,
      },
      false,
    ],
    [
      {
        highlightsFeatureFlag: false,
        curationFeatureFlag: false,
      },
      false,
    ],
  ])('highlights link, when %s, is visible: %s', async (
    { highlightsFeatureFlag, curationFeatureFlag },
    expected,
  ) => {
    getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: highlightsFeatureFlag });
    const store = mockStore(initialState);
    render(<SidebarWrapper
      store={store}
      enterpriseAppContextValue={{
        ...initialEnterpriseAppContextValue,
        enterpriseCuration: {
          enterpriseCuration: {
            isHighlightFeatureActive: curationFeatureFlag,
          },
        },
      }}
    />);
    const highlightsLink = expect(screen.queryByRole('link', { name: 'Highlights' }));
    if (expected) {
      highlightsLink.toBeInTheDocument();
    } else {
      highlightsLink.not.toBeInTheDocument();
    }
  });

  it('hides highlights when we have groups with a subset of all learners', async () => {
    getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: true });
    const store = mockStore({
      ...initialState,
      portalConfiguration: {
        enterpriseFeatures: {
          enterpriseGroupsV1: true,
        },
      },
    });

    LmsApiService.fetchEnterpriseGroup.mockImplementation(() => Promise.resolve({
      data: { results: [{ applies_to_all_contexts: false }] },
    }));
    render(<SidebarWrapper store={store} />);
    const highlightsLink = expect(screen.queryByRole('link', { name: 'Highlights' }));
    // we have to wait for the async call to set the state
    setTimeout(() => {
      expect(highlightsLink).not.toBeInTheDocument();
    }, 1000);

    LmsApiService.fetchEnterpriseGroup.mockImplementation(() => Promise.resolve({
      data: { results: [{ applies_to_all_contexts: true }] },
    }));
    render(<SidebarWrapper store={store} />);
    setTimeout(() => {
      expect(highlightsLink).toBeInTheDocument();
    }, 1000);
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
    it('does not display notification bubble when there are no new archived courses', () => {
      getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: true });
      const contextValue = {
        enterpriseCuration: {
          enterpriseCuration: {
            isHighlightFeatureActive: true,
          },
          isNewArchivedContent: false,
        },
      };
      render(<SidebarWrapper enterpriseAppContextValue={contextValue} />);
      expect(screen.queryByRole('link', { name: 'Code Management has unread notifications' })).not.toBeInTheDocument();
    });
    it('displays notification bubble when there are new archived courses', () => {
      getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: true });
      const contextValue = {
        enterpriseCuration: {
          enterpriseCuration: {
            isHighlightFeatureActive: true,
          },
          isNewArchivedContent: true,
        },
      };
      render(<SidebarWrapper enterpriseAppContextValue={contextValue} />);
      expect(screen.getByRole('link', { name: 'Highlights has unread notifications' })).toBeInTheDocument();
    });
  });
});
