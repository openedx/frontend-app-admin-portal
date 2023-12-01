import React from 'react';
import {
  Stack, Card, Badge, Skeleton,
} from '@edx/paragon';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  useBudgetId,
  useSubsidyAccessPolicy,
  useBudgetDetailHeaderData,
  useEnterpriseOffer,
  formatDate,
  useSubsidySummaryAnalyticsApi,
} from './data';

import BudgetDetailPageBreadcrumbs from './BudgetDetailPageBreadcrumbs';
import BudgetDetailPageOverviewAvailability from './BudgetDetailPageOverviewAvailability';
import BudgetDetailPageOverviewUtilization from './BudgetDetailPageOverviewUtilization';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';

const BudgetStatusBadge = ({
  badgeVariant, status, term, date,
}) => (
  <Stack direction="horizontal" gap={2}>
    <Badge variant={badgeVariant}>{ status }</Badge>
    <span className="small">{term} { formatDate(date) }</span>
  </Stack>
);

BudgetStatusBadge.propTypes = {
  badgeVariant: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

const BudgetDetailPageHeader = ({ enterpriseUUID }) => {
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
  });

  if (!subsidyAccessPolicy && (isLoadingSubsidySummary || isLoadingEnterpriseOffer)) {
    return (
      <div data-testid="budget-detail-skeleton">
        <Skeleton height={180} />
        <span className="sr-only">Loading budget header data</span>
      </div>
    );
  }

  if (subsidyAccessPolicy === null && subsidySummary === null) {
    return null;
  }

  return (
    <Stack gap={2}>
      <BudgetDetailPageBreadcrumbs budgetDisplayName={budgetDisplayName} />
      <Card className="budget-overview-card">
        <Card.Section>
          <h2>{ budgetDisplayName }</h2>
          <BudgetStatusBadge badgeVariant={badgeVariant} status={status} term={term} date={date} />
          <BudgetDetailPageOverviewAvailability
            budgetId={budgetId}
            budgetTotalSummary={budgetTotalSummary}
            isAssignable={isAssignable}
          />
          <BudgetDetailPageOverviewUtilization
            budgetId={budgetId}
            budgetTotalSummary={budgetTotalSummary}
            budgetAggregates={budgetAggregates}
            isAssignable={isAssignable}
          />
        </Card.Section>
      </Card>
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetDetailPageHeader.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPageHeader);
