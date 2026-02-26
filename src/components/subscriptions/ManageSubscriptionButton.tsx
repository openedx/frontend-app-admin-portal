import React, { useState } from 'react';
import { connect } from 'react-redux';

import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { Error, Launch, SpinnerSimple } from '@openedx/paragon/icons';

import { openStripeBillingPortal } from './data/utils';

type ManageSubscriptionButtonState = 'default' | 'pending' | 'error';

interface ManageSubscriptionButtonProps {
  enterpriseUuid: string;
  className?: string;
  variant?: string;
}

const buttonMessages = defineMessages({
  default: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.default',
    defaultMessage: 'Manage subscription',
    description: 'Button text that links out to manage their subscriptions on the billing dashboard.',
  },
  pending: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.loading',
    defaultMessage: 'Manage subscription',
    description: 'Button text while we are creating a new billing session',
  },
  error: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.error',
    defaultMessage: 'Manage subscription',
    description: 'Text for the button when creating a new session has failed',
  },
});

const ManageSubscriptionButton = ({
  enterpriseUuid,
  className,
  variant = 'outline-primary',
}: ManageSubscriptionButtonProps) => {
  const intl = useIntl();
  const [currentState, setCurrentState] = useState<ManageSubscriptionButtonState>('default');

  const handleManageSubscriptionClick = async () => {
    setCurrentState('pending');
    const newState = await openStripeBillingPortal(enterpriseUuid);
    setCurrentState(newState);
  };

  return (
    <StatefulButton
      state={currentState}
      data-testid="manage-subscription-button"
      className={className}
      labels={{
        default: intl.formatMessage(buttonMessages.default),
        pending: intl.formatMessage(buttonMessages.pending),
        error: intl.formatMessage(buttonMessages.error),
      }}
      icons={{
        default: <Icon src={Launch} />,
        pending: <Icon src={SpinnerSimple} className="icon-spin" />,
        error: <Icon src={Error} />,
      }}
      disabledStates={['pending']}
      variant={variant}
      onClick={handleManageSubscriptionClick}
    />
  );
};

const mapStateToProps = (state: { portalConfiguration: { enterpriseId: string } }) => ({
  enterpriseUuid: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ManageSubscriptionButton);
