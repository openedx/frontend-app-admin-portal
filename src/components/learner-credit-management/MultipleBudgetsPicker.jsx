import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Row,
  Col,
} from '@edx/paragon';

import BudgetCard from './BudgetCard-V2';

const MultipleBudgetsPicker = ({
  offers,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => (
  <Stack gap={4}>
    <Row>
      <Col lg="12"><h2>Budgets</h2></Col>
    </Row>
    <Row>
      <Col lg="12">
        <Stack gap={4}>
          {offers.map(offer => (
            <BudgetCard
              key={offer.id}
              offer={offer}
              enterpriseUUID={enterpriseUUID}
              enterpriseSlug={enterpriseSlug}
              enableLearnerPortal={enableLearnerPortal}
              offerType={offer.source}
              displayName={offer.name}
            />
          ))}
        </Stack>
      </Col>
    </Row>
  </Stack>
);

MultipleBudgetsPicker.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default MultipleBudgetsPicker;
