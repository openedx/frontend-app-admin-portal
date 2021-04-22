import React from 'react';
import PropTypes from 'prop-types';
import {
  CardGrid,
  Row,
  Col,
} from '@edx/paragon';

import SubscriptionCard from './SubscriptionCard';
import { DEFAULT_LEAD_TEXT } from './data/constants';

const MultipleSubscriptionsPicker = ({
  enterpriseSlug, leadText, buttonText, redirectPage, subscriptions,
}) => (
  <>
    <Row>
      <Col>
        <h2>Cohorts</h2>
        <p className="lead">
          {leadText}
        </p>
      </Col>
    </Row>
    <CardGrid>
      {subscriptions.map(subscription => (
        <SubscriptionCard
          key={subscription?.uuid}
          uuid={subscription?.uuid}
          title={subscription?.title}
          enterpriseSlug={enterpriseSlug}
          startDate={subscription?.startDate}
          expirationDate={subscription?.expirationDate}
          licenses={subscription?.licenses || {}}
          redirectPage={redirectPage}
          buttonText={buttonText}
        />
      ))}
    </CardGrid>
  </>
);

MultipleSubscriptionsPicker.defaultProps = {
  redirectPage: 'subscriptions',
  leadText: DEFAULT_LEAD_TEXT,
  buttonText: null,
};

MultipleSubscriptionsPicker.propTypes = {
  buttonText: PropTypes.string,
  enterpriseSlug: PropTypes.string.isRequired,
  leadText: PropTypes.string,
  redirectPage: PropTypes.string,
  subscriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default MultipleSubscriptionsPicker;
