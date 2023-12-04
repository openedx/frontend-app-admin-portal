import { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  Stack,
  Skeleton,
} from '@edx/paragon';

import { BUDGET_STATUSES, ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { formatPrice, getBudgetStatus } from './data/utils';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

const BackgroundFetchingWrapper = ({ children, isFetching }) => (
  <span style={{ opacity: isFetching ? 0.5 : 1 }}>{children}</span>
);

const SubBudgetCard = ({
  id,
  start,
  end,
  available,
  pending,
  spent,
  displayName,
  enterpriseSlug,
  isLoading,
}) => {
  const { isFetchingBudgets } = useContext(EnterpriseSubsidiesContext);
  const budgetLabel = getBudgetStatus(start, end);
  const formattedDate = dayjs(budgetLabel?.date).format('MMMM D, YYYY');

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
      <Stack direction="horizontal" gap={2.5}>
        <Badge variant={budgetLabel.badgeVariant}>{budgetLabel.status}</Badge>
        <span data-testid="budget-date">
          {budgetLabel.term} {formattedDate}
        </span>
      </Stack>
    );

    return (
      <Card.Header
        title={(
          <BackgroundFetchingWrapper isFetching={isFetchingBudgets}>
            {budgetType}
          </BackgroundFetchingWrapper>
        )}
        subtitle={(
          <BackgroundFetchingWrapper isFetching={isFetchingBudgets}>
            {subtitle}
          </BackgroundFetchingWrapper>
        )}
        actions={
          budgetLabel.status !== BUDGET_STATUSES.scheduled
            ? renderActions(budgetId)
            : undefined
        }
      />
    );
  };

  const renderCardSection = () => (
    <Card.Section
      title={<h4>Balance</h4>}
      muted
    >
      <Row className="d-flex flex-row justify-content-start w-md-75">
        <Col xs="6" md="auto" className="mb-3 mb-md-0">
          <div className="small font-weight-bold">Available</div>
          <span className="small">
            {isFetchingBudgets ? <Skeleton /> : formatPrice(available)}
          </span>
        </Col>
        {pending > 0 && (
          <Col xs="6" md="auto" className="mb-3 mb-md-0">
            <div className="small font-weight-bold">Pending</div>
            <span className="small">
              {isFetchingBudgets ? <Skeleton /> : formatPrice(pending)}
            </span>
          </Col>
        )}
        <Col xs="6" md="auto" className="mb-3 mb-md-0">
          <div className="small font-weight-bold">Spent</div>
          <span className="small">
            {isFetchingBudgets ? <Skeleton /> : formatPrice(spent)}
          </span>
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
        <Stack gap={4}>
          {renderCardHeader(displayName || 'Overview', id)}
          {budgetLabel.status !== BUDGET_STATUSES.scheduled && renderCardSection()}
        </Stack>
      </Card.Body>
    </Card>
  );
};

BackgroundFetchingWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

SubBudgetCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  start: PropTypes.string,
  end: PropTypes.string,
  spent: PropTypes.number,
  isLoading: PropTypes.bool,
  available: PropTypes.number,
  pending: PropTypes.number,
  displayName: PropTypes.string,
};

export default SubBudgetCard;
