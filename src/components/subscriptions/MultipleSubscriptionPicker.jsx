import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from '@openedx/paragon';

import SubscriptionCard from './SubscriptionCard';
import { DEFAULT_LEAD_TEXT, SELF_SERVICE_PAID, SELF_SERVICE_TRIAL } from './data/constants';
import ManageSubscriptionButton from './ManageSubscriptionButton';

const MultipleSubscriptionsPicker = ({
  leadText, subscriptions, createActions,
}) => {
  const hasSelfServiceSubs = subscriptions.some(sub => [SELF_SERVICE_PAID, SELF_SERVICE_TRIAL].includes(sub.planType));
  return (
    <Row>
      <Col lg="10">
        <span className="d-flex justify-content-between">
          <h2>Plans</h2>
          {hasSelfServiceSubs && (
            <ManageSubscriptionButton />
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

MultipleSubscriptionsPicker.defaultProps = {
  leadText: DEFAULT_LEAD_TEXT,
  createActions: null,
};

MultipleSubscriptionsPicker.propTypes = {
  leadText: PropTypes.string,
  subscriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  createActions: PropTypes.func,
};

export default MultipleSubscriptionsPicker;
