import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generatePath, useParams, Link } from 'react-router-dom';
import {
  Button, Col, ProgressBar, Row, Stack,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from './data';
import useEnterpriseGroup from './data/hooks/useEnterpriseGroup';
import EVENT_NAMES from '../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from './constants';

const BudgetDetail = ({ available, utilized, limit }) => {
  const currentProgressBarLimit = (available / limit) * 100;

  return (
    <Stack className="border border-light-400 p-4">
      <h4>Available</h4>
      <Stack direction="horizontal" gap={4} className="mt-1">
        <span className="display-1 text-dark" data-testid="budget-detail-available">{formatPrice(available)}</span>
        <span className="mt-auto small text-monospace" data-testid="budget-detail-utilized">
          Utilized {formatPrice(utilized)}
        </span>
      </Stack>
      <Stack gap={2} className="mt-3">
        <ProgressBar now={currentProgressBarLimit} variant="info" />
        <span className="ml-auto small text-monospace" data-testid="budget-detail-limit">
          {formatPrice(limit)} limit
        </span>
      </Stack>
    </Stack>
  );
};

BudgetDetail.propTypes = {
  available: PropTypes.number.isRequired,
  utilized: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

const BudgetActions = ({ budgetId, isAssignable, enterpriseId }) => {
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const { data: appliesToAllContexts } = useEnterpriseGroup(subsidyAccessPolicy);
  const { openInviteModal } = useContext(BudgetDetailPageContext);

  const trackEventMetadata = {};
  if (subsidyAccessPolicy) {
    const {
      subsidyUuid, assignmentConfiguration, isSubsidyActive, catalogUuid, aggregates,
    } = subsidyAccessPolicy;
    Object.assign(
      trackEventMetadata,
      {
        subsidyUuid,
        assignmentConfiguration,
        isSubsidyActive,
        isAssignable,
        catalogUuid,
        aggregates,
      },
    );
  }

  if (!isAssignable) {
    if (appliesToAllContexts === true) {
      return (
        <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
          <div>
            <h3>Manage edX for your organization</h3>
            <p>
              All people in your organization can choose what to learn
              from the catalog and spend from the available balance to enroll.
            </p>
            <Link to={`/${enterpriseSlug}/admin/settings/access`}>
              <Button variant="outline-primary">Configure access</Button>
            </Link>,
          </div>
        </div>
      );
    }
    return (
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h3>Drive learner-led enrollments by inviting members</h3>
          <p>
            Members of this budget can choose what to learn from the catalog
            and spend from the available balance to enroll.
          </p>
          <Button
            variant="brand"
            onClick={openInviteModal}
            target="_blank"
            iconBefore={Add}
          >
            New members
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center pt-4 pt-lg-0">
      <div>
        <h3>Lead the way to learning that matters</h3>
        <p>Assign content to people using the available budget to cover the cost of enrollment.</p>
        <Button
          variant="brand"
          className="mt-3"
          iconBefore={Add}
          as={Link}
          to={generatePath(LEARNER_CREDIT_ROUTE, {
            enterpriseSlug, enterpriseAppPage, budgetId, activeTabKey: 'catalog',
          })}
          state={{ budgetActivityScrollToKey: 'catalog' }}
          onClick={() => sendEnterpriseTrackEvent(
            enterpriseId,
            EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_OVERVIEW_NEW_ASSIGNMENT,
            trackEventMetadata,
          )}
        >
          New assignment
        </Button>
      </div>
    </div>
  );
};

BudgetActions.propTypes = {
  budgetId: PropTypes.string.isRequired,
  isAssignable: PropTypes.bool.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const BudgetDetailPageOverviewAvailability = ({
  budgetId,
  isAssignable,
  budgetTotalSummary: { available, utilized, limit },
  enterpriseFeatures,
  enterpriseId,
}) => (
  <Stack className="mt-4">
    <Row>
      <Col lg={7}>
        <BudgetDetail available={available} utilized={utilized} limit={limit} />
      </Col>
      <Col lg={5}>
        <BudgetActions
          budgetId={budgetId}
          isAssignable={isAssignable && enterpriseFeatures.topDownAssignmentRealTimeLcm}
          enterpriseId={enterpriseId}
        />
      </Col>
    </Row>
  </Stack>
);

const budgetTotalSummaryShape = {
  utilized: PropTypes.number.isRequired,
  available: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

BudgetDetailPageOverviewAvailability.propTypes = {
  budgetId: PropTypes.string.isRequired,
  budgetTotalSummary: PropTypes.shape(budgetTotalSummaryShape).isRequired,
  isAssignable: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewAvailability);
