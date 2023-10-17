import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Stack,
  Badge,
  Icon,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { formatDate, getBudgetStatus } from './data';
import useOffersBudgets from './data/hooks/useOffersBudgets';
import LearnerCreditAggregateCards from './LearnerCreditAggregateCards';

const BudgetAggregates = ({
  enterpriseUUID,
  offers,
}) => {
  const { budgetId } = useParams();
  const {
    isLoading: isLoadingBudgets,
    allBudgets,
  } = useOffersBudgets(enterpriseUUID, offers);
  const budget = allBudgets?.find(item => item.id === budgetId);
  const budgetLabel = getBudgetStatus(budget?.start, budget?.end);
  const renderCardHeader = () => {
    const subtitle = (
      <Stack direction="horizontal" gap={2.5}>
        <Badge variant={budgetLabel?.badgeVarient} className="m-0">{budgetLabel?.status}</Badge>
        <span data-testid="offer-date">
          {formatDate(budget?.start)} - {formatDate(budget?.end)}
        </span>
      </Stack>
    );

    return (
      <Card.Header
        title={budget?.displayName || 'Overview'}
        subtitle={subtitle}
      />
    );
  };
  const infoMessage = `Data last updated on ${formatDate(budget?.start)}. This data reflects the current active learner credit
  credit only and does not include any spend by your organization (codes, manual enrollments,
  past learner credit plans)`;

  return (
    <Card isLoading={isLoadingBudgets}>
      {renderCardHeader()}
      <Card.Section className="pt-0 d-flex flex-column">
        <Stack direction="horizontal" gap={1} className="d-flex align-items-start my-3">
          <Icon src={Info} className="mr-2 pt-1" />
          <FormattedMessage id="adminPortal.detailPage.budgetInfo" defaultMessage={infoMessage} />
        </Stack>
        <div className="d-flex flex-wrap mx-n3">
          <LearnerCreditAggregateCards
            totalFunds={budget?.totalFunds}
            redeemedFunds={budget?.redeemedFunds}
            remainingFunds={budget?.remainingFunds}
            percentUtilized={budget?.percentUtilized}
          />
        </div>
      </Card.Section>
    </Card>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetAggregates.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  offers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default connect(mapStateToProps)(BudgetAggregates);
