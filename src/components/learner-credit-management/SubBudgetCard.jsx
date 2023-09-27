import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card,
  Button,
  Row,
  Col,
} from '@edx/paragon';

import { BUDGET_STATUSES, ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { formatPrice, getBudgetStatus } from './data/utils';

const SubBudgetCard = ({
  id,
  start,
  end,
  available,
  spent,
  displayName,
  enterpriseSlug,
  isLoading,
}) => {
  const formattedStartDate = dayjs(start).format('MMMM D, YYYY');
  const formattedExpirationDate = dayjs(end).format('MMMM D, YYYY');
  const budgetStatus = getBudgetStatus(start, end);

  const renderActions = (budgetId) => (
    <Button
      data-testid="view-budget"
      as={Link}
      to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${budgetId}`}
    >
      View budget
    </Button>
  );

  const renderCardHeader = (budgetType, budgetId) => {
    const subtitle = (
      <div className="d-flex flex-wrap align-items-center">
        <span data-testid="offer-date">
          {formattedStartDate} - {formattedExpirationDate}
        </span>
      </div>
    );

    return (
      <Card.Header
        title={budgetType}
        subtitle={subtitle}
        className="mb-3"
        actions={
                    budgetStatus !== BUDGET_STATUSES.upcoming
                      ? renderActions(budgetId)
                      : undefined
                }
      />
    );
  };

  const renderCardSection = (availableBalance, spentBalance) => (
    <Card.Section
      title="Balance"
      muted
    >
      <Row className="d-flex flex-row justify-content-start w-md-75">
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Available</span>
          <span>{formatPrice(availableBalance)}</span>
        </Col>
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Spent</span>
          <span>{formatPrice(spentBalance)}</span>
        </Col>
      </Row>
    </Card.Section>
  );

  return (
    <Card
      orientation="horizontal"
      isLoading={isLoading}
    >
      <Card.Body>
        {renderCardHeader(displayName || 'Overview', id)}
        {budgetStatus !== BUDGET_STATUSES.upcoming && renderCardSection(available, spent)}
      </Card.Body>
    </Card>
  );
};

SubBudgetCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  id: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
  spent: PropTypes.number,
  isLoading: PropTypes.bool,
  available: PropTypes.number,
  displayName: PropTypes.string,
};

export default SubBudgetCard;
