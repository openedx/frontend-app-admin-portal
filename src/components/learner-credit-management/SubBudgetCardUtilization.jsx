import PropTypes from 'prop-types';
import { Col, Skeleton, Card } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { formatPrice } from './data';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const SubBudgetCardUtilization = ({
  isAssignable,
  isFetchingBudgets,
  status,
  available,
  pending,
  spent,
}) => {
  const isRetiredOrExpired = (
    status === BUDGET_STATUSES.retired || status === BUDGET_STATUSES.expired
  );

  return (
    <Card.Section
      title={!isRetiredOrExpired && (
        <h4>
          <FormattedMessage
            id="lcm.budgets.budget.card.balance"
            defaultMessage="Balance"
            description="Header for the balance section of the budget card"
          />
        </h4>
      )}
      muted
    >
      <Col className="d-flex justify-content-start w-md-75" data-testid="aggregates-section">
        {!isRetiredOrExpired && (
          <>
            <Col xs="6" md="auto" className="mb-3 mb-md-0 ml-n4.5">
              <div className="small font-weight-bold">
                <FormattedMessage
                  id="lcm.budgets.budget.card.available"
                  defaultMessage="Available"
                  description="Label for the available balance on the budget card"
                />
              </div>
              <span className="small">
                {isFetchingBudgets ? <Skeleton /> : formatPrice(available)}
              </span>
            </Col>
            {isAssignable && (
            <Col xs="6" md="auto" className="mb-3 mb-md-0">
              <div className="small font-weight-bold">
                <FormattedMessage
                  id="lcm.budgets.budget.card.assigned"
                  defaultMessage="Assigned"
                  description="Label for the assigned balance on the budget card"
                />
              </div>
              <span className="small">
                {isFetchingBudgets ? <Skeleton /> : formatPrice(pending)}
              </span>
            </Col>
            )}
          </>
        )}
        <Col xs="6" md="auto" className={classNames('mb-3 mb-md-0', { 'ml-n4.5': isRetiredOrExpired })}>
          <div className={classNames('font-weight-bold', {
            h4: isRetiredOrExpired,
            small: !isRetiredOrExpired,
          })}
          >
            <FormattedMessage
              id="lcm.budgets.budget.card.spent"
              defaultMessage="Spent"
              description="Label for the spent balance on the budget card"
            />
          </div>
          <span className={classNames({ 'font-size-base': isRetiredOrExpired })}>
            {isFetchingBudgets ? <Skeleton /> : formatPrice(spent)}
          </span>
        </Col>
      </Col>
    </Card.Section>
  );
};

SubBudgetCardUtilization.propTypes = {
  isAssignable: PropTypes.bool,
  isFetchingBudgets: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  available: PropTypes.number,
  pending: PropTypes.number,
  spent: PropTypes.number,
};

SubBudgetCardUtilization.defaultProps = {
  available: 0,
  pending: 0,
  spent: 0,
};

export default SubBudgetCardUtilization;
