import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import SubscriptionCard from './SubscriptionCard';
import {
  DEFAULT_LEAD_TEXT,
  SELF_SERVICE_PAID,
  SELF_SERVICE_TRIAL,
} from './data/constants';
import ManageSubscriptionButton from './ManageSubscriptionButton';

const MultipleSubscriptionsPicker = ({
  leadText, subscriptions, createActions,
}) => {
  const intl = useIntl();
  const hasSelfServiceSubs = subscriptions.some(sub => [SELF_SERVICE_PAID, SELF_SERVICE_TRIAL].includes(sub.planType));
  const shouldUseLocalizedDefaultLeadText = leadText === undefined || leadText === DEFAULT_LEAD_TEXT;
  const resolvedLeadText = shouldUseLocalizedDefaultLeadText ? intl.formatMessage({
    id: 'admin.portal.subscription.management.plans.lead.text',
    defaultMessage: 'Invite your learners to access your course catalog and manage your subscription cohorts.',
    description: 'Lead text for the subscription plans section.',
  }) : leadText;

  return (
    <Row>
      <Col lg="10">
        <span className="d-flex justify-content-between">
          <h2>{intl.formatMessage({
            id: 'admin.portal.subscription.management.plans.heading',
            defaultMessage: 'Plans',
            description: 'Heading for the subscription plans section.',
          })}
          </h2>
          {hasSelfServiceSubs && (
            <ManageSubscriptionButton />
          )}
        </span>
        <p>{resolvedLeadText}</p>
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

MultipleSubscriptionsPicker.defaultProps = {
  leadText: undefined,
  createActions: null,
};

MultipleSubscriptionsPicker.propTypes = {
  leadText: PropTypes.string,
  subscriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  createActions: PropTypes.func,
};

export default MultipleSubscriptionsPicker;
