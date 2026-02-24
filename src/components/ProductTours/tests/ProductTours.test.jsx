/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import {
  cleanup, render, screen, waitFor,
} from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import { features } from '../../../config';
import ProductTours from '../ProductTours';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  TOUR_TARGETS,
} from '../constants';
import adminsTabNewFeatureTour, { generateAdminsTabAlertCookieName } from '../adminsTabNewFeatureTour';
import browseAndRequestTour from '../browseAndRequestTour';
import learnerCreditTour from '../learnerCreditTour';
import learnerDetailPageTour from '../learnerDetailPageTour';
import portalAppearanceTour from '../portalAppearanceTour';
import highlightsTour from '../highlightsTour';
import { ONBOARDING_WELCOME_MODAL_COOKIE_NAME } from '../AdminOnboardingTours/constants';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { ACCESS_TAB } from '../../settings/data/constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import { SUBSIDY_TYPES } from '../../../data/constants/subsidyTypes';
import useHydrateAdminOnboardingData from '../AdminOnboardingTours/data/useHydrateAdminOnboardingData';
import { queryClient } from '../../test/testUtils';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const mockStore = configureMockStore([thunk]);

jest.mock('@2uinc/frontend-enterprise-utils', () => {
  const actualModule = jest.requireActual('@2uinc/frontend-enterprise-utils');
  return {
    ...actualModule,
    sendEnterpriseTrackEvent: jest.fn(),
  };
});

const ENTERPRISE_SLUG = 'sluggy';
const ENTERPRISE_UUID = 'test-enterprise-uuid';
const mockIntl = { formatMessage: ({ defaultMessage }) => defaultMessage };

const SUBSCRIPTION_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`;
const SETTINGS_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.settings}/${ACCESS_TAB}`;
const LEARNER_CREDIT_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.learnerCredit}`;

let onboardingEnabled = true;
let lastLogin = null;

jest.mock('../AdminOnboardingTours/data/useHydrateAdminOnboardingData');

const ToursWithContext = ({
  subsidyType = SUPPORTED_SUBSIDY_TYPES.license,
  subsidyRequestsEnabled = false,
  canManageLearnerCredit = false,
  enableLearnerPortal = false,
  enableInviteAdmins = false,
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
      enterpriseId: ENTERPRISE_UUID,
      enableLearnerPortal,
      enterpriseFeatures: {
        enterpriseAdminOnboardingEnabled: onboardingEnabled,
        enterpriseInviteAdminsEnabled: enableInviteAdmins,
      },
    },
    enterpriseCustomerAdmin: {
      lastLogin,
      onboardingTourCompleted: false,
      onboardingTourDismissed: false,
    },
  }),
}) => (
  <QueryClientProvider client={queryClient()}>
    <Provider store={store}>
      <IntlProvider locale="en">
        <Router initialEntries={[`${SUBSCRIPTION_PAGE_LOCATION}`]}>
          <Routes>
            <Route
              path={`/${ENTERPRISE_SLUG}/admin/:enterpriseAppPage`}
              element={(
                <EnterpriseSubsidiesContext.Provider value={EnterpriseSubsidiesContextValue}>
                  <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
                    <>
                      <ProductTours />
                      <p id={TOUR_TARGETS.PEOPLE_MANAGEMENT}>People Management</p>
                      <p id={TOUR_TARGETS.LEARNER_CREDIT}>Learner Credit Management</p>
                      <p id={TOUR_TARGETS.SETTINGS_SIDEBAR}>Settings</p>
                    </>
                  </SubsidyRequestsContext.Provider>
                </EnterpriseSubsidiesContext.Provider>
              )}
            />
          </Routes>
        </Router>
      </IntlProvider>
    </Provider>
  </QueryClientProvider>

);

describe('<ProductTours/>', () => {
  beforeEach(() => {
    mergeConfig({ FEATURE_CONTENT_HIGHLIGHTS: false });
    mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: false });
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    global.localStorage.clear();
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ToursWithContext />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  afterEach(() => cleanup());

  describe('portal appearance tour', () => {
    let appearanceFeatureFlagValue;
    beforeEach(() => {
      appearanceFeatureFlagValue = features.SETTINGS_PAGE_APPEARANCE_TAB;
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
    });
    afterAll(() => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = appearanceFeatureFlagValue;
    });

    it('returns correct tour config with i18n strings', () => {
      const tourConfig = portalAppearanceTour({ enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('Portal Appearance feature'),
        advanceButtonText: 'Next',
        endButtonText: 'End',
        target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
      }));
      expect(tourConfig).toHaveProperty('onAdvance');
      expect(tourConfig).toHaveProperty('onDismiss');
      expect(tourConfig).toHaveProperty('onEnd');
    });

    it('is shown when feature is enabled, and no cookie found', () => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = true;
      render(<ToursWithContext />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
      expect(screen.queryByText('Portal Appearance feature', { exact: false })).toBeTruthy();
    });
    it('is not shown when feature is turned off', () => {
      features.SETTINGS_PAGE_APPEARANCE_TAB = false;
      render(<ToursWithContext />);
      expect(screen.queryByText('Portal Appearance', { exact: false })).toBeFalsy();
    });
  });

  describe('browse and request tour', () => {
    beforeEach(() => {
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
      global.localStorage.setItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true);
    });

    it('returns correct tour config with i18n strings', () => {
      const tourConfig = browseAndRequestTour({ enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('browse for courses'),
        advanceButtonText: 'Next',
        endButtonText: 'End',
        target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
      }));
      expect(tourConfig).toHaveProperty('onAdvance');
      expect(tourConfig).toHaveProperty('onDismiss');
      expect(tourConfig).toHaveProperty('onEnd');
    });

    it('is shown when feature is enabled, enterprise is eligible for browse and request, and no cookie found', () => {
      render(<ToursWithContext enableLearnerPortal />);
      expect(screen.queryByText('browse for courses', { exact: false })).toBeTruthy();
    });

    it('is not shown if enterprise already has subsidy requests turned on', () => {
      render(<ToursWithContext enableLearnerPortal subsidyRequestsEnabled />);
      expect(screen.queryByText('browse for courses', { exact: false })).toBeFalsy();
    });

    it('is not shown when feature is enabled and localStorage record found ', () => {
      global.localStorage.setItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME, true);
      render(<ToursWithContext enableLearnerPortal />);
      expect(screen.queryByText('New Feature')).toBeFalsy();
    });

    it('it is shown in settings page', () => {
      render(<ToursWithContext enableLearnerPortal pathname={SETTINGS_PAGE_LOCATION} />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
    });

    it('is not shown if enterprise does not have subsidies that can be used for browse and request', () => {
      render(
        <ToursWithContext
          enableLearnerPortal
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

  describe('admins tab new feature tour', () => {
    beforeEach(() => {
      global.localStorage.setItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME, true);
      global.localStorage.setItem(LEARNER_CREDIT_COOKIE_NAME, true);
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
      global.localStorage.setItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true);
    });

    it('returns correct tour config with i18n strings', () => {
      const tourConfig = adminsTabNewFeatureTour({
        enterpriseSlug: ENTERPRISE_SLUG, enterpriseId: ENTERPRISE_UUID, intl: mockIntl,
      });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('invite and manage your admins'),
        advanceButtonText: 'Next',
        endButtonText: 'Dismiss',
        target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
      }));
      expect(tourConfig).toHaveProperty('onAdvance');
      expect(tourConfig).toHaveProperty('onDismiss');
      expect(tourConfig).toHaveProperty('onEnd');
    });

    it('is not shown when invite admins feature is disabled', () => {
      render(<ToursWithContext />);
      expect(screen.queryByText("We've recently added the ability for you to invite and manage your admins.", { exact: false })).toBeFalsy();
    });

    it('is shown when invite admins feature is enabled and alert cookie is not set', () => {
      render(<ToursWithContext enableInviteAdmins />);
      expect(screen.queryByText("We've recently added the ability for you to invite and manage your admins.", { exact: false })).toBeTruthy();
    });

    it('is not shown when invite admins alert cookie is set for the user', () => {
      const alertCookie = generateAdminsTabAlertCookieName();
      global.localStorage.setItem(alertCookie, true);
      render(<ToursWithContext enableInviteAdmins />);
      expect(screen.queryByText("We've recently added the ability for you to invite and manage your admins.", { exact: false })).toBeFalsy();
    });

    it('sets invite admins alert cookie when closed via X button', () => {
      const alertCookie = generateAdminsTabAlertCookieName();
      const tour = adminsTabNewFeatureTour({
        enterpriseId: ENTERPRISE_UUID, enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl,
      });
      tour.onDismiss();
      expect(global.localStorage.getItem(alertCookie)).toBe('true');
    });

    it('sets invite admins alert cookie when dismissed via Dismiss button', () => {
      const alertCookie = generateAdminsTabAlertCookieName();
      const tour = adminsTabNewFeatureTour({
        enterpriseId: ENTERPRISE_UUID, enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl,
      });
      tour.onEnd();
      expect(global.localStorage.getItem(alertCookie)).toBe('true');
    });
  });

  describe('learner credit management tour', () => {
    beforeEach(() => {
      mergeConfig({ FEATURE_LEARNER_CREDIT_MANAGEMENT: true });
      global.localStorage.setItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME, true);
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
      global.localStorage.setItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true);
    });

    it('returns correct tour config with i18n strings', () => {
      const tourConfig = learnerCreditTour({ enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('Learner Credit feature'),
        advanceButtonText: 'Next',
        endButtonText: 'End',
        target: `#${TOUR_TARGETS.LEARNER_CREDIT}`,
      }));
      expect(tourConfig).toHaveProperty('onAdvance');
      expect(tourConfig).toHaveProperty('onDismiss');
      expect(tourConfig).toHaveProperty('onEnd');
    });

    it('is shown if Learner Credit Management feature is on, enterprise has subsidy', () => {
      render(<ToursWithContext canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
      expect(screen.queryByText('Learner Credit feature', { exact: false })).toBeTruthy();
    });

    it('is not shown if localStorage record is present', () => {
      global.localStorage.setItem(LEARNER_CREDIT_COOKIE_NAME, true);
      render(<ToursWithContext canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeFalsy();
    });

    it('is shown if in Learner Credit page', () => {
      render(<ToursWithContext pathname={LEARNER_CREDIT_PAGE_LOCATION} canManageLearnerCredit />);
      expect(screen.queryByText('New Feature')).toBeTruthy();
    });
  });

  describe('TourCollapsible', () => {
    it('renders the collapsible title', () => {
      render(<ToursWithContext />);
      expect(screen.queryByText('Quick Start Guide')).toBeTruthy();
    });
    it('renders the welcome modal and opens the quick start guide', async () => {
      render(<ToursWithContext />);
      expect(screen.queryByText('Welcome!')).toBeTruthy();
      userEvent.click(screen.getByText('Get started'));
      // "Get started" button should un-collapse the quick start guide
      await waitFor(() => {
        expect(screen.queryByText(
          'Select any item in the guide to learn more about your administrative portal.',
        )).toBeTruthy();
      });
    });
    it('dismissed the modal with an existing user', async () => {
      lastLogin = '2023-09-15T15:30:00Z';
      render(<ToursWithContext />);
      expect(screen.queryByText('Hello!')).toBeTruthy();
      userEvent.click(screen.getByTestId('welcome-modal-dismiss'));
      await waitFor(() => {
        expect(screen.queryByText('Hello.')).not.toBeTruthy();
      });
    });
    it('hides the the welcome modal after user has seen it', () => {
      global.localStorage.setItem(ONBOARDING_WELCOME_MODAL_COOKIE_NAME, true);
      render(<ToursWithContext />);
      expect(screen.queryByText('Welcome!')).not.toBeTruthy();
    });
    it('renders quick start guide step titles when expanded', async () => {
      global.localStorage.setItem(ONBOARDING_WELCOME_MODAL_COOKIE_NAME, true);
      render(<ToursWithContext />);
      // FloatingCollapsible starts open by default, so step titles are immediately visible.
      // Only steps not filtered by feature flags / context are checked here.
      await waitFor(() => {
        expect(screen.queryByText('Track learner progress')).toBeTruthy();
        expect(screen.queryByText('Organize learners')).toBeTruthy();
        expect(screen.queryByText('Set up preferences')).toBeTruthy();
      });
    });

    describe('with onboarding disabled', () => {
      beforeEach(() => {
        onboardingEnabled = false;
      });
      it('does not render the collapsible title', () => {
        render(<ToursWithContext />);
        expect(screen.queryByText('Quick Start Guide')).toBeFalsy();
      });
    });
  });

  describe('highlights tour', () => {
    it('returns correct tour config with i18n strings', () => {
      const tourConfig = highlightsTour({ enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('Highlights feature'),
        advanceButtonText: 'Next',
        endButtonText: 'End',
        target: `#${TOUR_TARGETS.CONTENT_HIGHLIGHTS}`,
      }));
      expect(tourConfig).toHaveProperty('onAdvance');
      expect(tourConfig).toHaveProperty('onDismiss');
      expect(tourConfig).toHaveProperty('onEnd');
    });
  });

  describe('learner detail page tour', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.localStorage.setItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME, true);
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
      global.localStorage.setItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true);
    });

    it('returns correct tour config with i18n strings', () => {
      const tourConfig = learnerDetailPageTour({ enterpriseSlug: ENTERPRISE_SLUG, intl: mockIntl });
      expect(tourConfig).toEqual(expect.objectContaining({
        title: 'New Feature',
        body: expect.stringContaining('learner profile feature'),
        advanceButtonText: 'Next',
        endButtonText: 'Dismiss',
        target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
      }));
      expect(tourConfig).toHaveProperty('onDismiss');
    });

    it('is shown when no cookie found', () => {
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, undefined);
      render(<ToursWithContext />);
      expect(screen.queryByText('learner profile feature', { exact: false })).toBeTruthy();
    });
    it('dismiss learner profile product tour', async () => {
      global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, undefined);
      render(<ToursWithContext />);
      expect(screen.queryByText('learner profile feature', { exact: false })).toBeTruthy();
      const closeButton = screen.getByRole('button', { name: 'Close tour' });
      userEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByText('learner profile feature', { exact: false })).not.toBeTruthy();
      });
    });
  });
});
