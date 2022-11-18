/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform';
import { Router, Route } from 'react-router-dom';

import { features } from '../../../config';
import ProductTours from '../ProductTours';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
  TOUR_TARGETS,
} from '../constants';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { SETTINGS_TABS_VALUES } from '../../settings/data/constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import { SUBSIDY_TYPES } from '../../../data/constants/subsidyTypes';

const mockStore = configureMockStore([thunk]);

const ENTERPRISE_SLUG = 'sluggy';

const useHistoryPush = jest.fn();

const SUBSCRIPTION_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`;
const SETTINGS_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}`;
const LEARNER_CREDIT_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.learnerCredit}`;

const historyMock = (pathname = SUBSCRIPTION_PAGE_LOCATION) => ({
  push: useHistoryPush,
  location: { pathname },
  listen: jest.fn(),
});

function ToursWithContext({
  pathname = undefined,
  subsidyType = SUPPORTED_SUBSIDY_TYPES.license,
  subsidyRequestsEnabled = false,
  canManageLearnerCredit = false,
  enableLearnerPortal = true,
  EnterpriseSubsidiesContextValue = {
    canManageLearnerCredit,
    enterpriseSubsidyTypes: [SUBSIDY_TYPES.coupon],
  },
  subsidyRequestContextValue = {
    subsidyRequestConfiguration: {
      subsidyType,
      subsidyRequestsEnabled,
    },
    enterpriseSubsidyTypesForRequests: [SUBSIDY_TYPES.coupon],
  },
  store = mockStore({
    portalConfiguration: {
      enterpriseSlug: ENTERPRISE_SLUG,
      enableLearnerPortal,
    },
  }),
}) {
  return (
    <Provider store={store}>
      <Router history={historyMock(pathname)}>
        <Route
          path={`/${ENTERPRISE_SLUG}/admin/:enterpriseAppPage`}
          render={
          () => (
            <EnterpriseSubsidiesContext.Provider value={EnterpriseSubsidiesContextValue}>
              <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
                <>
                  <ProductTours />
                  <p id={TOUR_TARGETS.LEARNER_CREDIT}>Learner Credit Management</p>
                  <p id={TOUR_TARGETS.SETTINGS_SIDEBAR}>Settings</p>
                </>
              </SubsidyRequestsContext.Provider>
            </EnterpriseSubsidiesContext.Provider>
          )
        }
        />
      </Router>
    </Provider>
  );
}

const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/;  Domain=${window.location.host};`
    + 'Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
};

describe('<ProductTours/>', () => {
  beforeEach(() => {
    mergeConfig({ FEATURE_CONTENT_HIGHLIGHTS: false });
    mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: false });
    deleteCookie(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
    deleteCookie(LEARNER_CREDIT_COOKIE_NAME);
    deleteCookie(PORTAL_APPEARANCE_TOUR_COOKIE_NAME);
    deleteCookie(HIGHLIGHTS_COOKIE_NAME);
  });
  afterEach(() => cleanup());

  describe('portal appearance tour', () => {
    let appearanceFeatureFlagValue;
    beforeAll(() => {
      appearanceFeatureFlagValue = features.SETTINGS_PAGE_APPEARANCE_TAB;
    });
    afterAll(() => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = appearanceFeatureFlagValue;
    });

    it('is shown when feature is enabled, and no cookie found', () => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = true;
      render(<ToursWithContext />);
      expect(screen.queryByText('Portal Appearance', { exact: false })).toBeTruthy();
    });
    it('is not shown when feature is turned off', () => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = false;
      render(<ToursWithContext />);
      expect(screen.queryByText('Portal Appearance', { exact: false })).toBeFalsy();
    });
  });

  describe('browse and request tour', () => {
    it('is shown when feature is enabled, enterprise is eligible for browse and request, and no cookie found', () => {
      render(<ToursWithContext />);
      expect(screen.queryByText('browse for courses', { exact: false })).toBeTruthy();
    });

    it('is not shown if enterprise already has subsidy requests turned on', () => {
      render(<ToursWithContext subsidyRequestsEnabled />);
      expect(screen.queryByText('browse for courses', { exact: false })).toBeFalsy();
    });

    it('is not shown when feature is enabled and cookie found ', () => {
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}=true`,
      });
      render(<ToursWithContext />);
      expect(screen.queryByText('New Feature')).toBeFalsy();
    });

    it('it is shown in settings page', () => {
      render(<ToursWithContext pathname={SETTINGS_PAGE_LOCATION} />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
    });

    it('is not shown if enterprise does not have subsidies that can be used for browse and request', () => {
      render(
        <ToursWithContext
          subsidyRequestContextValue={{
            subsidyRequestConfiguration: {
              subsidyType: null,
              subsidyRequestsEnabled: false,
            },
            enterpriseSubsidyTypesForRequests: [],
          }}
        />,
      );
      expect(screen.queryByText('New Feature')).toBeFalsy();
    });
  });

  describe('learner credit management tour', () => {
    beforeEach(() => {
      // hide browse and request tour
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}=true`,
      });
    });

    it('is shown if Learner Credit Management feature is on, enterprise has subsidy', () => {
      mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: true });

      render(<ToursWithContext canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
    });

    it('is not shown if cookie is present', () => {
      mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: true });

      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}=true;${LEARNER_CREDIT_COOKIE_NAME}=true`,
      });

      render(<ToursWithContext canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeFalsy();
    });

    it('is is shown if in Learner Credit page', () => {
      mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: true });
      render(<ToursWithContext pathname={LEARNER_CREDIT_PAGE_LOCATION} canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
    });
  });
});
