import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Row,
  Col,
} from '@edx/paragon';

import BudgetCard from './BudgetCard';
import { orderBudgets } from './data/utils';

const MultipleBudgetsPicker = ({
  budgets,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const orderedBudgets = orderBudgets(budgets);
  console.log('[qa] budgets', budgets);
  return (
    <Stack gap={4}>
      <Row>
        <Col lg="12"><h2>Budgets</h2></Col>
      </Row>
      <Row>
        <Col lg="12">
          <Stack gap={4}>
            {orderedBudgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                enterpriseUUID={enterpriseUUID}
                enterpriseSlug={enterpriseSlug}
                enableLearnerPortal={enableLearnerPortal}
              />
            ))}
          </Stack>
        </Col>
      </Row>
    </Stack>
  );
};

MultipleBudgetsPicker.propTypes = {
  budgets: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default MultipleBudgetsPicker;
