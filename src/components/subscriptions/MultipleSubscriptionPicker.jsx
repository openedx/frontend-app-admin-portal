import React from 'react';
import PropTypes from 'prop-types';
import {
  CardGrid,
  Row,
  Col,
} from '@edx/paragon';

import SubscriptionCard from './SubscriptionCard';

export const DEFAULT_LEAD_TEXT = 'Invite your learners to access your course catalog and manage your subscription cohorts';

const MultipleSubscriptionsPicker = ({
  enterpriseSlug, useCatalog, leadText, buttonText, redirectPage, subscriptions,
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
          uuid={useCatalog ? subscription?.enterpriseCatalogUuid : subscription?.uuid}
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
  useCatalog: false,
  leadText: DEFAULT_LEAD_TEXT,
  buttonText: null,
};

MultipleSubscriptionsPicker.propTypes = {
  buttonText: PropTypes.string,
  enterpriseSlug: PropTypes.string.isRequired,
  leadText: PropTypes.string,
  redirectPage: PropTypes.string,
  useCatalog: PropTypes.bool,
  subscriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default MultipleSubscriptionsPicker;
