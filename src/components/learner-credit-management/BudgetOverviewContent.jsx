import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, Skeleton } from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  useBudgetDetailHeaderData,
  useBudgetId,
  useEnterpriseOffer, useSubsidyAccessPolicy,
  useSubsidySummaryAnalyticsApi,
} from './data';
import BudgetDetailPageOverviewAvailability from './BudgetDetailPageOverviewAvailability';
import BudgetDetailPageOverviewUtilization from './BudgetDetailPageOverviewUtilization';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';
import BudgetStatusSubtitle from './BudgetStatusSubtitle';

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
        <span className="sr-only">
          <FormattedMessage
            id="lcm.budget.detail.page.overview.loading"
            defaultMessage="Loading budget header data"
            description="Loading budget header data"
          />
        </span>
      </div>
    );
  }

  return (
    <Card>
      <Card.Section>
        <h2>{budgetDisplayName}</h2>
        <BudgetStatusSubtitle
          badgeVariant={badgeVariant}
          status={status}
          isAssignable={isAssignable}
          term={term}
          date={date}
          policy={subsidyAccessPolicy}
          enterpriseUUID={enterpriseUUID}
        />
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

BudgetOverviewContent.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetOverviewContent);
