import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useSubscriptionFromParams } from '../data/contextHooks';
import SubscriptionDetailPage from '../SubscriptionDetailPage';
import { renderWithRouter } from '../../test/testUtils';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

jest.mock('../SubscriptionDetailContextProvider', () => ({
  __esModule: true,
  default: () => <div>SUBSCRIPTION DEETS</div>,
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

const fakeSubscription = {};

describe('<SubscriptionDetailPage />', () => {
  it('renders the instant search component', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<SubscriptionDetailPage {...defaultProps} />);
    screen.getByText('SUBSCRIPTION DEETS');
  });
  it('shows a loading screen ', () => {
    useSubscriptionFromParams.mockReturnValue([null, true]);
    renderWithRouter(<SubscriptionDetailPage {...defaultProps} />);
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });
  it('redirects to the subscription choosing page if there is no subscription', () => {
    useSubscriptionFromParams.mockReturnValue([null, false]);
    const { history } = renderWithRouter(<SubscriptionDetailPage {...defaultProps} />);
    expect(history.location.pathname).toEqual(`/${defaultProps.match.params.enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`);
  });
});
