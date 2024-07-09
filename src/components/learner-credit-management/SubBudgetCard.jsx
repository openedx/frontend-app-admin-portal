import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  Card,
  Button,
  Badge,
  Stack,
} from '@openedx/paragon';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BUDGET_STATUSES, ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import {
  getBudgetStatus, getTranslatedBudgetStatus, getTranslatedBudgetTerm,
} from './data';
import { useEnterpriseBudgets } from '../EnterpriseSubsidiesContext/data/hooks';
import SubBudgetCardUtilization from './SubBudgetCardUtilization';

const BaseBackgroundFetchingWrapper = ({
  enterpriseId,
  isTopDownAssignmentEnabled,
  enablePortalLearnerCreditManagementScreen,
  children,
}) => {
  const { isFetching: isFetchingBudgets } = useEnterpriseBudgets({
    enablePortalLearnerCreditManagementScreen,
    enterpriseId,
    isTopDownAssignmentEnabled,
  });
  return <span style={{ opacity: isFetchingBudgets ? 0.5 : 1 }}>{children}</span>;
};

BaseBackgroundFetchingWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  isTopDownAssignmentEnabled: PropTypes.bool,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
};

BaseBackgroundFetchingWrapper.defaultProps = {
  isTopDownAssignmentEnabled: false,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enablePortalLearnerCreditManagementScreen: state.portalConfiguration.enablePortalLearnerCreditManagementScreen,
  isTopDownAssignmentEnabled: state.portalConfiguration.isTopDownAssignmentEnabled,
  enterpriseFeatures: state.features,
});

const BackgroundFetchingWrapper = connect(mapStateToProps)(BaseBackgroundFetchingWrapper);

const BaseSubBudgetCard = ({
  id,
  start,
  end,
  available,
  pending,
  spent,
  displayName,
  enterpriseSlug,
  enterpriseId,
  isTopDownAssignmentEnabled,
  enablePortalLearnerCreditManagementScreen,
  isLoading,
  isAssignable,
  isRetired,
  retiredAt,
}) => {
  const { isFetching: isFetchingBudgets } = useEnterpriseBudgets({
    enablePortalLearnerCreditManagementScreen,
    enterpriseId,
    isTopDownAssignmentEnabled,
  });
  const intl = useIntl();
  const budgetLabel = getBudgetStatus({
    intl,
    startDateStr: start,
    endDateStr: end,
    isBudgetRetired: isRetired,
    retiredDateStr: retiredAt,
  });
  const {
    status, term, badgeVariant, date,
  } = budgetLabel;
  const formattedDate = date ? intl.formatDate(
    dayjs(date).toDate(),
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ) : undefined;
  const isRetiredOrExpired = [BUDGET_STATUSES.expired, BUDGET_STATUSES.retired].includes(status);

  const hasBudgetAggregatesSection = () => {
    const statusesWithoutAggregates = [
      BUDGET_STATUSES.scheduled,
    ];
    return !statusesWithoutAggregates.includes(status);
  };

  const renderActions = (budgetId) => (
    <Button
      data-testid="view-budget"
      as={Link}
      to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${budgetId}`}
      variant={isRetiredOrExpired ? 'outline-primary' : 'primary'}
    >
      {isRetiredOrExpired ? (
        <FormattedMessage
          id="lcm.budgets.budget.card.view.budget.history"
          defaultMessage="View budget history"
          description="Button text to view budget history"
        />
      ) : (
        <FormattedMessage
          id="lcm.budgets.budget.card.view.budget"
          defaultMessage="View budget"
          description="Button text to view a budget"
        />
      )}
    </Button>
  );

  const renderCardHeader = (budgetType, budgetId) => {
    const subtitle = (
      <Stack direction="horizontal" gap={2.5}>
        <Badge variant={badgeVariant}>{getTranslatedBudgetStatus(intl, status)}</Badge>
        {(term && formattedDate) && (
          <span data-testid="budget-date">
            {getTranslatedBudgetTerm(intl, term)} {formattedDate}
          </span>
        )}
      </Stack>
    );

    const showActions = status !== BUDGET_STATUSES.scheduled;

    return (
      <Card.Header
        title={<BackgroundFetchingWrapper>{budgetType}</BackgroundFetchingWrapper>}
        subtitle={<BackgroundFetchingWrapper>{subtitle}</BackgroundFetchingWrapper>}
        actions={showActions ? renderActions(budgetId) : undefined}
        className={classNames('align-items-center', { 'mb-4.5': !hasBudgetAggregatesSection() })}
      />
    );
  };

  return (
    <Card
      orientation="horizontal"
      isLoading={isLoading}
      data-testid="balance-detail-section"
    >
      <Card.Body>
        <Stack gap={4.5}>
          {renderCardHeader(displayName || 'Overview', id)}
          {hasBudgetAggregatesSection() && (
            <SubBudgetCardUtilization
              isFetchingBudgets={isFetchingBudgets}
              isAssignable={isAssignable}
              status={status}
              available={available}
              pending={pending}
              spent={spent}
            />
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
};

BaseSubBudgetCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  isTopDownAssignmentEnabled: PropTypes.bool,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  start: PropTypes.string,
  end: PropTypes.string,
  spent: PropTypes.number,
  isLoading: PropTypes.bool,
  available: PropTypes.number,
  pending: PropTypes.number,
  displayName: PropTypes.string,
  isAssignable: PropTypes.bool,
  isRetired: PropTypes.bool,
  retiredAt: PropTypes.string,
};

BaseSubBudgetCard.defaultProps = {
  isTopDownAssignmentEnabled: false,
};

export default connect(mapStateToProps)(BaseSubBudgetCard);
