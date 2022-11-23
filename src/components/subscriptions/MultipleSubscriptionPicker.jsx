import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
} from '@edx/paragon';

import SubscriptionCard from './SubscriptionCard';
import { DEFAULT_LEAD_TEXT } from './data/constants';

const MultipleSubscriptionsPicker = ({
  leadText, subscriptions, createActions,
}) => (
  <Row>
    <Col xs="12">
      <h2>Plans</h2>
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
