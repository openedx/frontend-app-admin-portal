import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card, Col, Row, Skeleton,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import {
  useBudgetDetailHeaderData,
  useBudgetId,
  useEnterpriseOffer, useSubsidyAccessPolicy,
  useSubsidySummaryAnalyticsApi,
} from '../data';
import BudgetDetail from '../BudgetDetail';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';
import BudgetStatusSubtitle from '../BudgetStatusSubtitle';
import LmsApiService from '../../../data/services/LmsApiService';

const InviteModalBudgetCard = ({
  enterpriseUUID,
  enterpriseFeatures,
}) => {
  const { subsidyAccessPolicyId, enterpriseOfferId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const [memberCount, setMemberCount] = useState(null);

  const fetchMemberCount = async () => {
    try {
      const groupUuid = subsidyAccessPolicy.groupAssociations[0];
      const response = await LmsApiService.fetchEnterpriseGroupLearners(groupUuid, null);
      setMemberCount(response.data.count);
    } catch (error) {
      logError(error);
      throw error;
    }
  };
  fetchMemberCount();

  const memberSubtitle = memberCount ? `${memberCount} current members` : '';
  const budgetType = (enterpriseOfferId !== null) ? BUDGET_TYPES.ecommerce : BUDGET_TYPES.policy;

  const { isLoading: isLoadingSubsidySummary, subsidySummary } = useSubsidySummaryAnalyticsApi(
    enterpriseUUID,
    enterpriseOfferId,
    budgetType,
  );

  const { isLoading: isLoadingEnterpriseOffer, data: enterpriseOfferMetadata } = useEnterpriseOffer(enterpriseOfferId);

  const policyOrOfferId = subsidyAccessPolicyId || enterpriseOfferId;
  const {
    budgetDisplayName,
    budgetTotalSummary,
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

  if (!subsidyAccessPolicy && (isLoadingSubsidySummary || isLoadingEnterpriseOffer || memberCount !== null)) {
    return (
      <div data-testid="budget-detail-skeleton">
        <Skeleton height={180} />
        <span className="sr-only">Loading budget header data</span>
      </div>
    );
  }

  const { available, utilized, limit } = budgetTotalSummary;
  return (
    <Card className="budget-overview-card m-3">
      <Card.Section>
        <Row>
          <Col lg={5}>
            <h4>{budgetDisplayName}</h4>
            <p>{memberSubtitle}</p>
            <BudgetStatusSubtitle
              badgeVariant={badgeVariant}
              status={status}
              isAssignable={isAssignable}
              term={term}
              date={date}
              policy={subsidyAccessPolicy}
              enterpriseUUID={enterpriseUUID}
            />
          </Col>
          <Col lg={7}>
            <BudgetDetail available={available} utilized={utilized} limit={limit} status={status} />
          </Col>
        </Row>
      </Card.Section>
    </Card>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

InviteModalBudgetCard.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(InviteModalBudgetCard);
