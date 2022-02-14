import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { useSubscriptionFromParams } from '../data/contextHooks';
import SubscriptionDetailPageWithTabs from '../SubscriptionDetailPageWithTabs';
import { renderWithRouter } from '../../test/testUtils';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

jest.mock('../SubscriptionDetailContextProvider', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: ({ children }) => (
    <div data-testid="subscription-context-provider">{children}</div>
  ),
}));
jest.mock('../expiration/SubscriptionExpirationModals', () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-expiration-modals" />,
}));
jest.mock('../SubscriptionDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-details" />,
}));
jest.mock('../licenses/LicenseAllocationDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="license-allocation-details" />,
}));
jest.mock('../SubscriptionEnrollmentRequests', () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-enrollment-requests" />,
}));

jest.mock('../data/contextHooks', () => ({
  useSubscriptionFromParams: jest.fn(),
}));

const TEST_ENTERPRISE_SLUG = 'sluggy';
const TEST_SUBSCRIPTION_UUID = 'test-uuid-1';
const defaultProps = {
  match: {
    params: {
      enterpriseSlug: TEST_ENTERPRISE_SLUG,
      subscriptionUUID: TEST_SUBSCRIPTION_UUID,
      tabKey: 'learners',
    },
  },
};
const fakeSubscription = { uuid: TEST_SUBSCRIPTION_UUID };

describe('<SubscriptionDetailPage />', () => {
  it('renders the subscription detail page', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<SubscriptionDetailPageWithTabs {...defaultProps} />);
    screen.getByTestId('subscription-context-provider');
    screen.getByTestId('subscription-expiration-modals');
    screen.getByTestId('subscription-details');
  });

  it('shows a loading screen ', () => {
    useSubscriptionFromParams.mockReturnValue([null, true]);
    renderWithRouter(<SubscriptionDetailPageWithTabs {...defaultProps} />);
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });

  it('redirects to the subscription choosing page if there is no subscription', () => {
    useSubscriptionFromParams.mockReturnValue([null, false]);
    const { history } = renderWithRouter(<SubscriptionDetailPageWithTabs {...defaultProps} />);
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`);
  });

  it('redirects to "/learners" if no tab key is specified', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    const props = {
      ...defaultProps,
      match: {
        params: {
          ...defaultProps.match.params,
          tabKey: undefined,
        },
      },
    };
    const { history } = renderWithRouter(
      <SubscriptionDetailPageWithTabs {...props} />,
      { route: `/${TEST_ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}/${TEST_SUBSCRIPTION_UUID}` },
    );
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}/${TEST_SUBSCRIPTION_UUID}/learners`);
  });

  it('pushes tab selection onto history stack', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<SubscriptionDetailPageWithTabs {...defaultProps} />);

    // "Manage Learners" is active
    const manageLearnersBtn = screen.getByText('Manage Learners');
    expect(manageLearnersBtn).toHaveClass('active');

    // Click "Manage Requests"
    userEvent.click(screen.getByText('Manage Requests'));
    waitFor(() => {
      const manageRequestsBtn = screen.getByText('Manage Requests');
      expect(manageRequestsBtn).toHaveClass('active');
    });
  });
});
