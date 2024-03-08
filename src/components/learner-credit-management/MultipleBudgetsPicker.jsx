import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  CardView,
  TextFilter,
  CheckboxFilter,
  Row,
  Col,
} from '@edx/paragon';
import groupBy from 'lodash/groupBy';

import BudgetCard from './BudgetCard';
import { getBudgetStatus, orderBudgets } from './data/utils';

const MultipleBudgetsPicker = ({
  budgets,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const orderedBudgets = orderBudgets(budgets);

  const rows = useMemo(
    () => orderedBudgets.map(budget => {
      const budgetLabel = getBudgetStatus({
        startDateStr: budget.start,
        endDateStr: budget.end,
        isBudgetRetired: budget.isRetired,
      });

      return ({
        ...budget,
        status: budgetLabel.status,
        enterpriseUUID,
        enterpriseSlug,
        enableLearnerPortal,
      });
    }),
    [orderedBudgets, enterpriseUUID, enterpriseSlug, enableLearnerPortal],
  );

  const budgetLabels = orderedBudgets.map(budget => {
    return getBudgetStatus({
      startDateStr: budget.start,
      endDateStr: budget.end,
      isBudgetRetired: budget.isRetired,
    })
  });
  const budgetLabelsByStatus = groupBy(budgetLabels, 'status');
  const reducedChoices = Object.keys(budgetLabelsByStatus).map(budgetLabel => ({
    name: budgetLabel,
    number: budgetLabelsByStatus[budgetLabel].length,
    value: budgetLabel,
  }));

  return (
    <>
      <Row className="mb-4">
        <Col lg="12"><h2>Budgets</h2></Col>
      </Row>
      <DataTable
        defaultColumnValues={{ Filter: TextFilter }}
        isFilterable
        itemCount={orderedBudgets.length || 0}
        data={rows}
        columns={[
          {
            Header: 'budget name',
            accessor: 'name',
          },
          {
            Header: 'Status',
            accessor: 'status',
            Filter: CheckboxFilter,
            filterChoices: reducedChoices,
          },
        ]}
      >
        <DataTable.TableControlBar />
        <CardView
          CardComponent={BudgetCard}
          columnSizes={{ xs: 12 }}
        />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

MultipleBudgetsPicker.propTypes = {
  budgets: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default MultipleBudgetsPicker;
