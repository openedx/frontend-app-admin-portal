import React from 'react';
import { ALERT_CLOSE_LABEL_TEXT } from '@openedx/paragon';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import OfferUtilizationAlerts from '../OfferUtilizationAlerts';
import {
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
} from '../data/constants';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const OfferUtilizationAlertsWrapper = (props) => (
  <IntlProvider locale="en">
    <OfferUtilizationAlerts {...props} />
  </IntlProvider>
);

describe('<OfferUtilizationAlerts />', () => {
  it('does not render any alerts if percent utilized and/or remaining funds is missing', () => {
    const { container } = render(
      <OfferUtilizationAlertsWrapper
        enterpriseUUID={TEST_ENTERPRISE_UUID}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render any alerts if conditions are not met', () => {
    const { container } = render(
      <OfferUtilizationAlertsWrapper
        enterpriseUUID={TEST_ENTERPRISE_UUID}
        percentUtilized={LOW_REMAINING_BALANCE_PERCENT_THRESHOLD - 0.1}
        remainingFunds={5000}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders low balance alert', async () => {
    const { container } = render(
      <OfferUtilizationAlertsWrapper
        enterpriseUUID={TEST_ENTERPRISE_UUID}
        percentUtilized={LOW_REMAINING_BALANCE_PERCENT_THRESHOLD + 0.1}
        remainingFunds={2500}
      />,
    );
    expect(screen.getByText('Low remaining funds')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();

    // assert alert is dismissible
    const dismissBtn = screen.getByText(ALERT_CLOSE_LABEL_TEXT);
    expect(dismissBtn).toBeInTheDocument();
    userEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders no balance alert', () => {
    render(
      <OfferUtilizationAlertsWrapper
        enterpriseUUID={TEST_ENTERPRISE_UUID}
        percentUtilized={0.99}
        remainingFunds={NO_BALANCE_REMAINING_DOLLAR_THRESHOLD}
      />,
    );
    expect(screen.getByText('No remaining funds')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();
    expect(screen.queryByText(ALERT_CLOSE_LABEL_TEXT)).not.toBeInTheDocument();
  });
});
