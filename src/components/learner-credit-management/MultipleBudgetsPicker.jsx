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

  const reducedChoices = orderedBudgets.reduce((acc, currentObject) => {
    const budgetLabel = getBudgetStatus({
      startDateStr: currentObject.start,
      endDateStr: currentObject.end,
      isBudgetRetired: currentObject.isRetired,
    });

    if (budgetLabel.status in acc) {
      acc[budgetLabel.status].number += 1;
    } else {
      acc[budgetLabel.status] = {
        name: budgetLabel.status,
        number: 1,
        value: budgetLabel.status,
      };
    }
    return acc;
  }, {});

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
            filterChoices: Object.values(reducedChoices),
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
