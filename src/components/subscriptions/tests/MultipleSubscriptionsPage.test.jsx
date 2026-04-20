import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  MemoryRouter, Route, Routes, mockNavigate,
} from 'react-router-dom';
import { axe } from 'jest-axe';
import { SubscriptionContext } from '../SubscriptionData';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import MultipleSubscriptionsPage from '../MultipleSubscriptionsPage';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

const fakeSlug = 'sluggo';
const defaultProps = {
  match: {
    params: {
      enterpriseSlug: fakeSlug,
    },
  },
};

// required for the expiration components
const fakeStore = {
  portalConfiguration: {
    enterpriseSlug: fakeSlug,
    enableCodeManagementScreen: false,
  },
};

const defaultSubscriptions = {
  data: {
    results: [
      {
        uuid: 'ided',
        title: 'Enterprise A',
        startDate: '2021-04-13',
        expirationDate: '2024-04-13',
        licenses: {
          allocated: 10,
          total: 20,
        },
        showExpirationNotifications: true,
      },
      {
        uuid: 'anotherid',
        title: 'Enterprise B',
        startDate: '2021-03-13',
        expirationDate: '2024-10-13',
        licenses: {
          allocated: 11,
          total: 30,
        },
        showExpirationNotifications: true,
      },
    ],
  },
  setErrors: () => {},
  errors: null,
  suppressedSubscriptionUuids: new Set(),
  stripeInfoByUuid: {},
};

const mockStore = configureMockStore([thunk]);

const MultipleSubscriptionsPageWrapper = ({ subscriptions = defaultSubscriptions, ...props }) => (
  <Provider store={mockStore(fakeStore)}>
    <IntlProvider locale="en">
      <SubscriptionContext.Provider value={subscriptions}>
        <MemoryRouter initialEntries={[`/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`]}>
          <Routes>
            <Route path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`} element={<MultipleSubscriptionsPage {...props} />} />
          </Routes>
        </MemoryRouter>
      </SubscriptionContext.Provider>
    </IntlProvider>
  </Provider>
);

describe('MultipleSubscriptionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MultipleSubscriptionsPageWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('displays the MultipleSubscriptionPicker when there are multiple subscriptions', () => {
    render(<MultipleSubscriptionsPageWrapper {...defaultProps} />);
    expect(screen.getByText('Plans')).toBeInTheDocument();
  });
  it('returns null if there are no subscriptions', () => {
    const subscriptions = { data: { results: [] }, suppressedSubscriptionUuids: new Set(), stripeInfoByUuid: {} };
    render(<MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />);
    expect(screen.queryByText('Plans')).not.toBeInTheDocument();
  });
  it('redirects if there is only one subscription, default redirectPage', () => {
    const subsUuid = 'bestuuid';
    const subscriptions = {
      data: {
        results: [{
          uuid: subsUuid,
          title: 'Enterprise A',
          startDate: '2021-04-13',
          expirationDate: '2024-04-13',
          licenses: {
            allocated: 10,
            total: 20,
          },
        }],
      },
      suppressedSubscriptionUuids: new Set(),
      stripeInfoByUuid: {},
    };
    render(<MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />);
    expect(mockNavigate).toHaveBeenLastCalledWith(`/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subsUuid}`);
  });
  it('redirects if there is only one subscription, custom redirect page', () => {
    const redirectPage = 'bulkenrollment';
    const subsUuid = 'bestuuid';
    const subscriptions = {
      data: {
        results: [{
          uuid: subsUuid,
          title: 'Enterprise A',
          startDate: '2021-04-13',
          expirationDate: '2024-04-13',
          licenses: {
            allocated: 10,
            total: 20,
          },
        }],
      },
      suppressedSubscriptionUuids: new Set(),
      stripeInfoByUuid: {},
    };
    render(
      <MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} redirectPage={redirectPage} />,
    );
    expect(mockNavigate).toHaveBeenCalledWith(`/${fakeSlug}/admin/${redirectPage}/${subsUuid}`);
  });

  it('does not redirect when the only visible subscription is a canceled trial and the paid renewal is suppressed', () => {
    const trialUuid = 'trial-only-uuid';
    const renewedUuid = 'suppressed-paid-uuid';
    const subscriptions = {
      data: {
        results: [
          {
            uuid: trialUuid,
            title: 'Canceled Trial Plan',
            startDate: '2024-01-01',
            expirationDate: '2025-01-01',
            licenses: { allocated: 5, total: 10 },
            showExpirationNotifications: true,
          },
          {
            uuid: renewedUuid,
            title: 'Suppressed Paid Plan',
            startDate: '2025-01-01',
            expirationDate: '2026-01-01',
            licenses: { allocated: 0, total: 10 },
            showExpirationNotifications: true,
          },
        ],
      },
      setErrors: () => {},
      errors: null,
      suppressedSubscriptionUuids: new Set([renewedUuid]),
      stripeInfoByUuid: {},
    };
    render(<MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />);
    // No redirect should happen even though only one subscription is visible after suppression
    expect(mockNavigate).not.toHaveBeenCalled();
    // The suppressed paid plan should not appear
    expect(screen.queryByText('Suppressed Paid Plan')).not.toBeInTheDocument();
  });

  it('hides the scheduled paid subscription card when the associated trial is canceled', () => {
    const trialUuid = 'trial-uuid';
    const renewedUuid = 'renewed-uuid';
    const otherUuid = 'other-uuid';
    // Three subscriptions: trial, its scheduled renewal (suppressed), and one other active plan.
    // After suppression, two remain → picker is rendered (no redirect).
    const subscriptions = {
      data: {
        results: [
          {
            uuid: trialUuid,
            title: 'Trial Plan',
            startDate: '2024-01-01',
            expirationDate: '2025-01-01',
            licenses: { allocated: 5, total: 10 },
            showExpirationNotifications: true,
          },
          {
            uuid: renewedUuid,
            title: 'Paid Renewal Plan',
            startDate: '2025-01-01',
            expirationDate: '2026-01-01',
            licenses: { allocated: 0, total: 10 },
            showExpirationNotifications: true,
          },
          {
            uuid: otherUuid,
            title: 'Other Active Plan',
            startDate: '2024-01-01',
            expirationDate: '2025-06-01',
            licenses: { allocated: 3, total: 10 },
            showExpirationNotifications: true,
          },
        ],
      },
      setErrors: () => {},
      errors: null,
      suppressedSubscriptionUuids: new Set([renewedUuid]),
      stripeInfoByUuid: {},
    };
    render(<MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />);
    // The suppressed renewal should not be rendered
    expect(screen.queryByText('Paid Renewal Plan')).not.toBeInTheDocument();
    // The trial and other plan cards are still shown
    expect(screen.getByText('Trial Plan')).toBeInTheDocument();
    expect(screen.getByText('Other Active Plan')).toBeInTheDocument();
  });
});
