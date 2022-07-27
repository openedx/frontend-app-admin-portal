import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useSubscriptionFromParams } from '../data/contextHooks';
import SubscriptionDetailPage from '../SubscriptionDetailPage';
import { SubscriptionManagementContext, SUBSCRIPTION_PLAN_ZERO_STATE } from './TestUtilities';
import { renderWithRouter } from '../../test/testUtils';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

jest.mock('../SubscriptionDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-details" />,
}));
jest.mock('../expiration/SubscriptionExpirationModals', () => ({
  __esModule: true,
  default: () => <div data-testid="subscription-expiration-modals" />,
}));
jest.mock('../licenses/LicenseAllocationDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="license-allocation-details" />,
}));

jest.mock('../data/contextHooks', () => ({
  useSubscriptionFromParams: jest.fn(),
}));

const defaultProps = {
  match: {
    params: {
      enterpriseSlug: 'sluggy',
      subscriptionUUID: 'uuid-ed',
    },
  },
};

const fakeSubscription = {
  uuid: 'fake-subscription-uuid',
};

function SubscriptionDetailPageWrapper(props) {
  return (
    <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ZERO_STATE}>
      <SubscriptionDetailPage {...props} />
    </SubscriptionManagementContext>
  );
}

describe('<SubscriptionDetailPage />', () => {
  it('renders the subscription detail page children components', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<SubscriptionDetailPageWrapper {...defaultProps} />);
    screen.getByTestId('subscription-details');
    screen.getByTestId('subscription-expiration-modals');
    screen.getByTestId('license-allocation-details');
  });
  it('shows a loading screen ', () => {
    useSubscriptionFromParams.mockReturnValue([null, true]);
    renderWithRouter(<SubscriptionDetailPageWrapper {...defaultProps} />);
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });
  it('redirects to the subscription choosing page if there is no subscription', () => {
    useSubscriptionFromParams.mockReturnValue([null, false]);
    const { history } = renderWithRouter(<SubscriptionDetailPageWrapper {...defaultProps} />);
    waitFor(() => {
      expect(history.location.pathname).toEqual(`/${defaultProps.match.params.enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`);
    });
  });
});
