import React from 'react';
import PropTypes from 'prop-types';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SubscriptionExpiredModal from '../../expiration/SubscriptionExpiredModal';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
} from '../TestUtilities';

const ExpiredModalWithContext = ({
  detailState,
  store,
  isOpen,
}) => (
  <SubscriptionManagementContext detailState={detailState} store={store}>
    <SubscriptionExpiredModal isOpen={isOpen} onClose={() => {}} />
  </SubscriptionManagementContext>
);

ExpiredModalWithContext.propTypes = {
  detailState: PropTypes.shape().isRequired,
  store: PropTypes.shape(),
  isOpen: PropTypes.bool,
};

ExpiredModalWithContext.defaultProps = {
  store: undefined,
  isOpen: true,
};

const detailStateCopy = (daysUntilExpiration) => ({
  ...SUBSCRIPTION_PLAN_ZERO_STATE,
  daysUntilExpiration,
});

describe('<SubscriptionExpiredModal />', () => {
  test('make sure component renders', () => {
    render(<ExpiredModalWithContext detailState={detailStateCopy(0)} />);
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  test('support button is rendered', async () => {
    render(<ExpiredModalWithContext detailState={detailStateCopy(0)} />);
    expect(screen.queryByText('Contact support')).toBeTruthy();
  });
});
