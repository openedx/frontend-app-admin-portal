import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  CardView,
  TextFilter,
  CheckboxFilter,
  Row,
  Col,
} from '@openedx/paragon';
import groupBy from 'lodash/groupBy';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import BudgetCard from './BudgetCard';
import { getBudgetStatus, getTranslatedBudgetStatus, orderBudgets } from './data/utils';

const MultipleBudgetsPicker = ({
  budgets,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const orderedBudgets = orderBudgets(budgets);
  const intl = useIntl();
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

  const budgetLabels = orderedBudgets.map(budget => (
    getBudgetStatus({
      startDateStr: budget.start,
      endDateStr: budget.end,
      isBudgetRetired: budget.isRetired,
    })
  ));
  const budgetLabelsByStatus = groupBy(budgetLabels, 'status');
  const reducedChoices = Object.keys(budgetLabelsByStatus).map(budgetLabel => ({
    name: getTranslatedBudgetStatus(intl, budgetLabel),
    number: budgetLabelsByStatus[budgetLabel].length,
    value: budgetLabel,
  }));

  return (
    <>
      <Row className="mb-4">
        <Col lg="12">
          <h2>
            <FormattedMessage
              id="lcm.budgets.budgets"
              defaultMessage="Budgets"
              description="Header for the budget picker page."
            />
          </h2>
        </Col>
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
            Header: intl.formatMessage({
              id: 'lcm.budgets.budgets.filters.status',
              defaultMessage: 'Status',
              description: 'Header for the status column in the budget picker page.',
            }),
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
