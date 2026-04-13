import React from 'react';
import PropTypes from 'prop-types';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { axe } from 'jest-axe';
import SubscriptionExpiredModal from '../../expiration/SubscriptionExpiredModal';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
} from '../TestUtilities';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

const ExpiredModalWithContext = ({
  detailState,
  store,
  isOpen,
}) => (
  <IntlProvider locale="en">
    <SubscriptionManagementContext detailState={detailState} store={store}>
      <SubscriptionExpiredModal isOpen={isOpen} onClose={() => {}} />
    </SubscriptionManagementContext>
  </IntlProvider>
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
  it('has no accessibility violations', async () => {
    const { container } = render(<ExpiredModalWithContext detailState={detailStateCopy(0)} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  test('make sure component renders', () => {
    render(<ExpiredModalWithContext detailState={detailStateCopy(0)} />);
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  test('support button is rendered', async () => {
    render(<ExpiredModalWithContext detailState={detailStateCopy(0)} />);
    expect(screen.queryByText('Contact support')).toBeTruthy();
  });
});
