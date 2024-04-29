import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generatePath, useParams, Link } from 'react-router-dom';
import {
  Button, Col, Hyperlink, ProgressBar, Row, Stack,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { configuration } from '../../config';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';
import {
  formatPrice,
  useBudgetId,
  useSubsidyAccessPolicy,
  useEnterpriseCustomer,
  useEnterpriseGroup,
} from './data';
import EVENT_NAMES from '../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from './constants';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';
import isLmsBudget from './utils';

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
  enterpriseGroupsV1,
  status,
}) => {
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const { data: appliesToAllContexts } = useEnterpriseGroup(subsidyAccessPolicy);
  const { data: enterpriseCustomer } = useEnterpriseCustomer(enterpriseId);
  const { openInviteModal } = useContext(BudgetDetailPageContext);
  const supportUrl = configuration.ENTERPRISE_SUPPORT_URL;

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

  if (status === BUDGET_STATUSES.expired) {
    return (
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h3>Keep people learning with a new plan</h3>
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
    if (enterpriseGroupsV1) {
      if (isLmsBudget(enterpriseCustomer?.activeIntegrations.length, appliesToAllContexts)) {
        return (
          <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
            <div>
              <h3>Manage edX in your integrated learning platform</h3>
              <p>
                People who have received access to discover edX content in your integrated
                learning platform can spend from this budget&apos;s available balance to enroll.
              </p>
              <Link to={`/${enterpriseSlug}/admin/settings/lms`}>
                <Button variant="outline-primary">Configure access</Button>
              </Link>
            </div>
          </div>
        );
      } if (appliesToAllContexts === true) {
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
        </div>;
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
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h4>Get people learning using this budget</h4>
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
  status: PropTypes.string.isRequired,
  enterpriseGroupsV1: PropTypes.bool.isRequired,
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
          enterpriseGroupsV1={enterpriseFeatures.enterpriseGroupsV1}
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
    enterpriseGroupsV1: PropTypes.bool,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewAvailability);
