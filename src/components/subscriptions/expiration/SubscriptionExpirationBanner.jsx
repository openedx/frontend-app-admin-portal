import React, { useContext, useState } from 'react';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
  SUBSCRIPTION_PLAN_RENEWAL_LOCK_PERIOD_HOURS,
} from '../data/constants';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { formatTimestamp } from '../../../utils';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';

const SubscriptionExpirationBanner = ({ isSubscriptionPlanDetails }) => {
  const {
    subscription: {
      agreementNetDaysUntilExpiration: daysUntilContractExpiration,
      daysUntilExpiration: daysUntilPlanExpiration,
      expirationDate,
      showExpirationNotifications,
      enterpriseCustomerUuid,
    },
  } = useContext(SubscriptionDetailContext);
  const [showBanner, setShowBanner] = useState(true);

  const daysUntilExpiration = isSubscriptionPlanDetails ? daysUntilPlanExpiration : daysUntilContractExpiration;
  const isSubscriptionExpired = daysUntilExpiration <= 0;

  const intl = useIntl();

  const renderPlanDetailsMessage = () => (isSubscriptionExpired ? (
    <>
      <Alert.Heading>
        {intl.formatMessage({
          id: 'admin.portal.subscription.expiration.banner.plan.expired.heading',
          defaultMessage: 'This subscription plan{apostrophe}s end date has passed',
          description: 'Heading for expired plan message in subscription expiration banner.',
        }, { apostrophe: "'" })}
      </Alert.Heading>
      {intl.formatMessage({
        id: 'admin.portal.subscription.expiration.banner.plan.expired.message',
        defaultMessage: 'Administrative actions are no longer available as of the plan end date of {expirationDate}. You may still view the statuses of your invited learners.',
        description: 'Message for expired plan message in subscription expiration banner.',
      }, { expirationDate: formatTimestamp({ timestamp: expirationDate }) })}
    </>
  ) : (
    <>
      <Alert.Heading>
        {intl.formatMessage({
          id: 'admin.portal.subscription.expiration.banner.plan.approaching.heading',
          defaultMessage: 'This subscription plan{apostrophe}s end date is approaching',
          description: 'Heading for approaching plan message in subscription expiration banner.',
        }, { apostrophe: "'" })}
      </Alert.Heading>
      {intl.formatMessage(
        {
          id: 'admin.portal.subscription.expiration.banner.plan.approaching.message',
          defaultMessage: 'Administrative actions will no longer be available beginning {hours} hours prior to the plan end date of {expirationDate}.',
          description: 'Message for approaching plan message in subscription expiration banner.',
        },
        {
          hours: SUBSCRIPTION_PLAN_RENEWAL_LOCK_PERIOD_HOURS,
          expirationDate: formatTimestamp({ timestamp: expirationDate }),
        },
      )}
    </>
  ));

  const renderContractDetailsMessage = () => (isSubscriptionExpired ? (
    <>
      <Alert.Heading>
        {intl.formatMessage({
          id: 'admin.portal.subscription.expiration.banner.contract.expired.heading',
          defaultMessage: 'Your subscription contract has expired',
          description: 'Heading for expired contract message in subscription expiration banner.',
        })}
      </Alert.Heading>
      {intl.formatMessage({
        id: 'admin.portal.subscription.expiration.banner.contract.expired.message',
        defaultMessage: 'Renew your subscription today to reconnect your learning community.',
        description: 'Message for expired contract message in subscription expiration banner.',
      })}
    </>
  ) : (
    <>
      <Alert.Heading>
        {intl.formatMessage({
          id: 'admin.portal.subscription.expiration.banner.contract.approaching.heading',
          defaultMessage: 'Your subscription contract is expiring soon',
          description: 'Heading for approaching contract message in subscription expiration banner.',
        })}
      </Alert.Heading>
      {intl.formatMessage({
        id: 'admin.portal.subscription.expiration.banner.contract.approaching.message',
        defaultMessage: 'Your current subscription contract will expire in {contractExpirationDays} days. Renew your subscription today to minimize access disruption for your learners.',
        description: 'Message for approaching contract message in subscription expiration banner.',
      }, { contractExpirationDays: daysUntilContractExpiration })}
    </>
  ));

  if (daysUntilExpiration > SUBSCRIPTION_DAYS_REMAINING_MODERATE) {
    return null;
  }

  let subscriptionExpirationThreshold = SUBSCRIPTION_DAYS_REMAINING_MODERATE;
  let dismissible = true;
  let alertType = 'info';

  if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    subscriptionExpirationThreshold = SUBSCRIPTION_DAYS_REMAINING_SEVERE;
    alertType = 'warning';
  }
  if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL) {
    subscriptionExpirationThreshold = SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL;
    dismissible = false;
    alertType = 'danger';
  }

  const emitAlertActionEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomerUuid,
      'edx.ui.admin_portal.subscriptions.expiration.alert.support_cta.clicked',
      {
        expiration_threshold: subscriptionExpirationThreshold,
        days_until_expiration: daysUntilExpiration,
      },
    );
  };

  const emitAlertDismissedEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomerUuid,
      'edx.ui.admin_portal.subscriptions.expiration.alert.dismissed',
      {
        expiration_threshold: subscriptionExpirationThreshold,
        days_until_expiration: daysUntilExpiration,
      },
    );
  };

  const actions = [];
  if (!isSubscriptionPlanDetails || daysUntilContractExpiration > SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    actions.push(<ContactCustomerSupportButton variant="primary" onClick={() => emitAlertActionEvent()} />);
  }

  const dismissBanner = () => {
    setShowBanner(false);
    emitAlertDismissedEvent();
  };

  if (!showExpirationNotifications) {
    return null;
  }

  return (
    <Alert
      className="expiration-alert mt-1"
      variant={alertType}
      dismissible={dismissible}
      show={showBanner}
      onClose={dismissBanner}
      actions={actions}
    >
      {isSubscriptionPlanDetails ? renderPlanDetailsMessage() : renderContractDetailsMessage()}
    </Alert>
  );
};

SubscriptionExpirationBanner.propTypes = {
  isSubscriptionPlanDetails: PropTypes.bool,
};

SubscriptionExpirationBanner.defaultProps = {
  isSubscriptionPlanDetails: false,
};

export default SubscriptionExpirationBanner;
