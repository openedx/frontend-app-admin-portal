import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge, Card, Skeleton, Stack,
} from '@edx/paragon';

import { connect } from 'react-redux';
import BudgetDetailPageOverviewAvailability from './BudgetDetailPageOverviewAvailability';
import BudgetDetailPageOverviewUtilization from './BudgetDetailPageOverviewUtilization';
import {
  formatDate,
  useBudgetDetailHeaderData,
  useBudgetId,
  useEnterpriseOffer, useSubsidyAccessPolicy,
  useSubsidySummaryAnalyticsApi,
} from './data';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

const BudgetStatusBadge = ({
  badgeVariant, status, term, date,
}) => (
  <Stack direction="horizontal" gap={2}>
    <Badge variant={badgeVariant}>{status}</Badge>
    {(term && date) && (
    <span className="small">{term} {formatDate(date)}</span>
    )}
  </Stack>
);

const BudgetOverviewContent = ({
  enterpriseUUID,
  enterpriseFeatures,
}) => {
  const { subsidyAccessPolicyId, enterpriseOfferId } = useBudgetId();

  const budgetType = (enterpriseOfferId !== null) ? BUDGET_TYPES.ecommerce : BUDGET_TYPES.policy;

  const { isLoading: isLoadingSubsidySummary, subsidySummary } = useSubsidySummaryAnalyticsApi(
    enterpriseUUID,
    enterpriseOfferId,
    budgetType,
  );

  const { isLoading: isLoadingEnterpriseOffer, data: enterpriseOfferMetadata } = useEnterpriseOffer(enterpriseOfferId);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const policyOrOfferId = subsidyAccessPolicyId || enterpriseOfferId;

  const {
    budgetId,
    budgetDisplayName,
    budgetTotalSummary,
    budgetAggregates,
    status,
    badgeVariant,
    term,
    date,
    isAssignable,
  } = useBudgetDetailHeaderData({
    subsidyAccessPolicy,
    subsidySummary,
    budgetId: policyOrOfferId,
    enterpriseOfferMetadata,
    isTopDownAssignmentEnabled: enterpriseFeatures.topDownAssignmentRealTimeLcm,
  });

  if (!subsidyAccessPolicy && (isLoadingSubsidySummary || isLoadingEnterpriseOffer)) {
    return (
      <div data-testid="budget-detail-skeleton">
        <Skeleton height={180} />
        <span className="sr-only">Loading budget header data</span>
      </div>
    );
  }

  return (
    <Card className="budget-overview-card">
      <Card.Section>
        <h2>{budgetDisplayName}</h2>
        <BudgetStatusBadge badgeVariant={badgeVariant} status={status} term={term} date={date} />
        <BudgetDetailPageOverviewAvailability
          budgetId={budgetId}
          budgetTotalSummary={budgetTotalSummary}
          isAssignable={isAssignable}
          status={status}
        />
        <BudgetDetailPageOverviewUtilization
          budgetId={budgetId}
          budgetTotalSummary={budgetTotalSummary}
          budgetAggregates={budgetAggregates}
          isAssignable={isAssignable}
        />
      </Card.Section>
    </Card>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetStatusBadge.propTypes = {
  badgeVariant: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

BudgetOverviewContent.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetOverviewContent);
