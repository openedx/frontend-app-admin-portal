import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import {
  breakpoints, Button, Col, Hyperlink, ProgressBar, Stack, Row, useMediaQuery,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { generatePath, useParams, Link } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from './data';
import { configuration } from '../../config';
import EVENT_NAMES from '../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from './constants';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const BudgetDetail = ({
  available, utilized, limit, status,
}) => {
  const currentProgressBarLimit = (available / limit) * 100;

  if (status === BUDGET_STATUSES.expired) {
    return (
      <Stack className="border border-light-400 p-4">
        <h4>Spent</h4>
        <Stack direction="horizontal" gap={4} className="mt-1">
          <span className="display-1 text-dark" data-testid="budget-detail-spent">{formatPrice(utilized)}</span>
          <span className="mt-auto small text-monospace" data-testid="budget-detail-unspent">
            Unspent {formatPrice(available)}
          </span>
        </Stack>
      </Stack>
    );
  }

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
  status: PropTypes.string.isRequired,
};

const BudgetActions = ({
  budgetId,
  isAssignable,
  enterpriseId,
  status,
}) => {
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const supportUrl = configuration.ENTERPRISE_SUPPORT_URL;
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

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

  const isLargeScreenOrGreater = useMediaQuery({ query: `(min-width: ${breakpoints.small.minWidth}px)` });

  if (status === BUDGET_STATUSES.expired) {
    return (
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h4>Get people learning using this budget</h4>
          <p>
            This budget has expired. To create a new budget, please contact support.
          </p>
          <Button
            variant="outline-primary"
            as={Hyperlink}
            destination={supportUrl}
            onClick={() => sendEnterpriseTrackEvent(
              enterpriseId,
              EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_OVERVIEW_CONTACT_US,
              trackEventMetadata,
            )}
            target="_blank"
          >
            Contact support
          </Button>
        </div>
      </div>
    );
  }

  if (!isAssignable) {
    return (
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h4>Keep people learning with a new plan</h4>
          <p>
            Funds from this budget are set to auto-allocate to registered learners based on
            settings configured with your support team.
          </p>
          <Button
            variant="outline-primary"
            as={Hyperlink}
            destination={supportUrl}
            onClick={() => sendEnterpriseTrackEvent(
              enterpriseId,
              EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_OVERVIEW_CONTACT_US,
              trackEventMetadata,
            )}
            target="_blank"
          >
            Contact support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center pt-4 pt-lg-0">
      <div className={classNames({ 'text-center': isLargeScreenOrGreater })}>
        <h4>Get people learning using this budget</h4>
        <Button
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
          New course assignment
        </Button>
      </div>
    </div>
  );
};

BudgetActions.propTypes = {
  budgetId: PropTypes.string.isRequired,
  isAssignable: PropTypes.bool.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

const BudgetDetailPageOverviewAvailability = ({
  budgetId,
  isAssignable,
  budgetTotalSummary: { available, utilized, limit },
  enterpriseFeatures,
  enterpriseId,
  status,
}) => (
  <Stack className="mt-4">
    <Row>
      <Col lg={7}>
        <BudgetDetail available={available} utilized={utilized} limit={limit} status={status} />
      </Col>
      <Col lg={5}>
        <BudgetActions
          budgetId={budgetId}
          isAssignable={isAssignable && enterpriseFeatures.topDownAssignmentRealTimeLcm}
          enterpriseId={enterpriseId}
          status={status}
        />
      </Col>
    </Row>
  </Stack>
);

BudgetDetailPageOverviewAvailability.propTypes = {
  budgetId: PropTypes.string.isRequired,
  budgetTotalSummary: PropTypes.shape({
    utilized: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
  }).isRequired,
  isAssignable: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewAvailability);
