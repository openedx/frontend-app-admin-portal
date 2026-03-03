import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Button, StatefulButton } from '@openedx/paragon';
import { Launch } from '@openedx/paragon/icons';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { features } from '../../config';
import { openStripeBillingPortal } from './data/utils';

interface ManageSubscriptionButtonProps {
  enterpriseUuid: string;
  className?: string;
  variant?: string;
}

const buttonMessages = defineMessages({
  default: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.default',
    defaultMessage: 'Manage subscription',
    description: 'Button text that links to the billing management page.',
  },
  pending: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.pending',
    defaultMessage: 'Opening...',
    description: 'Button text while opening Stripe billing portal.',
  },
  error: {
    id: 'subscriptions.manageSubscriptions.subscriptionButton.error',
    defaultMessage: 'Try again',
    description: 'Button text when opening Stripe billing portal failed.',
  },
});

const ManageSubscriptionButton = ({
  enterpriseUuid,
  className,
  variant = 'outline-primary',
}: ManageSubscriptionButtonProps) => {
  const intl = useIntl();
  const [buttonState, setButtonState] = useState<'default' | 'pending' | 'error'>('default');

  // When native billing is enabled, link to the billing page
  if (features.ENABLE_NATIVE_BILLING) {
    return (
      <Button
        data-testid="manage-subscription-button"
        className={className}
        variant={variant}
        as={Link}
        to={`/${enterpriseUuid}/admin/${ROUTE_NAMES.billing}`}
        iconAfter={Launch}
      >
        {intl.formatMessage(buttonMessages.default)}
      </Button>
    );
  }

  // When native billing is disabled, open Stripe billing portal in new tab
  const handleOpenStripePortal = async () => {
    setButtonState('pending');
    const result = await openStripeBillingPortal(enterpriseUuid);
    setButtonState(result);
  };

  return (
    <StatefulButton
      data-testid="manage-subscription-button"
      className={className}
      variant={variant}
      onClick={handleOpenStripePortal}
      state={buttonState}
      labels={{
        default: intl.formatMessage(buttonMessages.default),
        pending: intl.formatMessage(buttonMessages.pending),
        error: intl.formatMessage(buttonMessages.error),
      }}
      icons={{
        default: <Launch />,
        pending: <Launch />,
        error: <Launch />,
      }}
      disabledStates={['pending']}
    />
  );
};

const mapStateToProps = (state: { portalConfiguration: { enterpriseId: string } }) => ({
  enterpriseUuid: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ManageSubscriptionButton);
