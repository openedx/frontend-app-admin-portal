import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Col, Icon, Row, StatefulButton,
} from '@openedx/paragon';
import { Error, Launch, SpinnerSimple } from '@openedx/paragon/icons';

import SubscriptionCard from './SubscriptionCard';
import { DEFAULT_LEAD_TEXT, SELF_SERVICE_PAID, SELF_SERVICE_TRIAL } from './data/constants';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

const MultipleSubscriptionsPicker = ({
  enterpriseUuid, leadText, subscriptions, createActions,
}) => {
  const intl = useIntl();
  const [stripeSessionStatus, setStripeSessionStatus] = useState('default');
  const hasSelfServiceSubs = subscriptions.some(sub => [SELF_SERVICE_PAID, SELF_SERVICE_TRIAL].includes(sub.planType));

  const handleManageSubscriptionClick = async () => {
    setStripeSessionStatus('pending');
    try {
      const response = await EnterpriseAccessApiService.fetchStripeBillingPortalSession(enterpriseUuid);
      const results = camelCaseObject(response.data);
      if (results.url) {
        setStripeSessionStatus('default');
        window.open(results.url, '_blank', 'noopener,noreferrer');
      } else {
        setStripeSessionStatus('error');
      }
    } catch (error) {
      logError(error);
      setStripeSessionStatus('error');
    }
  };

  return (
    <Row>
      <Col lg="10">
        <span className="d-flex justify-content-between">
          <h2>Plans</h2>
          {hasSelfServiceSubs && (
          <StatefulButton
            labels={{
              default: intl.formatMessage({
                id: 'subscriptions.manageSubscriptions.stripeLinkButton.default',
                defaultMessage: 'Manage subscription',
                description: 'Button text that link out to manage their subscriptions on the Stripe billing dashboard.',
              }),
              pending: intl.formatMessage({
                id: 'subscriptions.manageSubscriptions.stripeLinkButton.loading',
                defaultMessage: 'Creating Stripe session',
                description: 'Button text while we are creating a new Stripe billing session',
              }),
              error: intl.formatMessage({
                id: 'subscriptions.manageSubscriptions.stripeLinkButton.error',
                defaultMessage: 'Try again',
                description: 'Text for the button when creating a new Stripe session has failed',
              }),
            }}
            icons={{
              default: <Icon src={Launch} />,
              pending: <Icon src={SpinnerSimple} className="icon-spin" />,
              error: <Icon src={Error} />,
            }}
            variant="outline-primary"
            state={stripeSessionStatus}
            onClick={handleManageSubscriptionClick}
          />
          )}
        </span>
        <p>{leadText}</p>
      </Col>
      <Col lg="10">
        {subscriptions.map(subscription => (
          <SubscriptionCard
            key={subscription.uuid}
            subscription={subscription}
            createActions={createActions}
          />
        ))}
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  enterpriseUuid: state.portalConfiguration.enterpriseId,
});

MultipleSubscriptionsPicker.defaultProps = {
  leadText: DEFAULT_LEAD_TEXT,
  createActions: null,
};

MultipleSubscriptionsPicker.propTypes = {
  enterpriseUuid: PropTypes.string.isRequired,
  leadText: PropTypes.string,
  subscriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  createActions: PropTypes.func,
};

export default connect(mapStateToProps)(MultipleSubscriptionsPicker);
