import React from 'react';
import PropTypes from 'prop-types';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SubscriptionExpiredModal from '../../expiration/SubscriptionExpiredModal';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
  createMockStore,
  DEFAULT_STORE_STATE,
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

describe('<SubscriptionExpiredModal />', () => {
  test('includes a link to the code mgmt page if the enterprise has the page enabled and the subscription is expired', () => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      daysUntilExpiration: 0,
    };
    render(<ExpiredModalWithContext detailState={detailStateCopy} />);
    expect(screen.queryByText('code management page')).toBeTruthy();
  });

  test('does NOT include a link to the code mgmt page if the enterprise has the page disabled and the subscription is expired', () => {
    const store = createMockStore({
      portalConfiguration: {
        ...DEFAULT_STORE_STATE.portalConfiguration,
        enableCodeManagementScreen: false,
      },
    });
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      daysUntilExpiration: 0,
    };
    render(<ExpiredModalWithContext detailState={detailStateCopy} store={store} />);
    expect(screen.queryByText('code management page')).toBeFalsy();
  });
});
