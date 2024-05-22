import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generatePath, useParams, Link } from 'react-router-dom';
import {
  Button, Col, Hyperlink, Row, Stack,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { configuration } from '../../config';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';
import {
  useBudgetId, useSubsidyAccessPolicy, useEnterpriseCustomer, useEnterpriseGroup,
} from './data';
import EVENT_NAMES from '../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from './constants';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';
import isLmsBudget from './utils';
import BudgetDetail from './BudgetDetail';

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
  const { data: enterpriseGroup } = useEnterpriseGroup(subsidyAccessPolicy);
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
          <h3>
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.keep.people.learning"
              defaultMessage="Keep people learning with a new plan"
              description="Title for the budget actions section on the budget detail page overview"
            />
          </h3>
          <p>
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.budget.expired"
              defaultMessage="This budget has expired. To create a new budget, please contact support."
              description="Description which tells that budget has expired and to create a new budget contact support"
            />
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
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.budget.expired.contact.support"
              defaultMessage="Contact support"
              description="Contact support button on expired budget detail page overview"
            />
          </Button>
        </div>
      </div>
    );
  }

  if (!isAssignable) {
    if (enterpriseGroupsV1) {
      if (isLmsBudget(enterpriseCustomer?.activeIntegrations.length, enterpriseGroup?.appliesToAllContexts)) {
        return (
          <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
            <div>
              <h3>
                <FormattedMessage
                  id="lcm.budget.detail.page.overview.budget.actions.manage.edx.in.integrated.learning.platform"
                  defaultMessage="Manage edX in your integrated learning platform"
                  description="Title which tells to customer to manage edX in their integrated learning platform"
                />
              </h3>
              <p>
                <FormattedMessage
                  id="lcm.budget.detail.page.overview.budget.actions.people.access.edx"
                  defaultMessage="People who have received access to discover edX content in your integrated learning platform can spend from this budget{apostrophe}s available balance to enroll."
                  description="Description which tells that people can spend from the budget's available balance to enroll"
                  values={{ apostrophe: "'" }}
                />
              </p>
              <Link to={`/${enterpriseSlug}/admin/settings/access`}>
                <Button variant="outline-primary">
                  <FormattedMessage
                    id="lcm.budget.detail.page.overview.budget.actions.configure.access"
                    defaultMessage="Configure access"
                    description="Configure access button on the budget detail page overview"
                  />
                </Button>
              </Link>
            </div>
          </div>
        );
      }

      if (enterpriseGroup?.appliesToAllContexts === true) {
        return (
          <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
            <div>
              <h3>
                <FormattedMessage
                  id="lcm.budget.detail.page.overview.budget.actions.manage.edx.for.organization"
                  defaultMessage="Manage edX for your organization"
                  description="Title for the budget actions section on the budget detail page overview"
                />
              </h3>
              <p>
                <FormattedMessage
                  id="lcm.budget.detail.page.overview.budget.actions.all.people.choose.learn"
                  defaultMessage="All people in your organization can choose what to learn
                from the catalog and spend from the available balance to enroll."
                  description="Description which tells that user can choose from the catalog and spend from the available balance to enroll"
                />
              </p>
              <Link to={`/${enterpriseSlug}/admin/settings/access`}>
                <Button variant="outline-primary">
                  <FormattedMessage
                    id="lcm.budget.detail.page.overview.budget.actions.configure.access.general"
                    defaultMessage="Configure access"
                    description="Configure access button on the budget detail page overview"
                  />
                </Button>
              </Link>
            </div>
          </div>
        );
      }

      return (
        <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
          <div>
            <h3>
              <FormattedMessage
                id="lcm.budget.detail.page.overview.budget.actions.drive.learner.led.enrollments"
                defaultMessage="Drive learner-led enrollments by inviting members"
                description="Title for the budget actions section on the budget detail page overview"
              />
            </h3>
            <p>
              <FormattedMessage
                id="lcm.budget.detail.page.overview.budget.actions.members.choose.learn"
                defaultMessage="Members of this budget can choose what to learn from the catalog and spend from the available balance to enroll."
                description="Description for the budget actions section on the budget detail page overview"
              />
            </p>
            <Button
              variant="brand"
              onClick={openInviteModal}
              target="_blank"
              iconBefore={Add}
            >
              <FormattedMessage
                id="lcm.budget.detail.page.overview.budget.actions.new.members"
                defaultMessage="New members"
                description="New members button on the budget detail page overview"
              />
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="h-100 d-flex align-items-center pt-4 pt-lg-0">
        <div>
          <h4>
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.get.people.learning"
              defaultMessage="Get people learning using this budget"
              description="Title that enables people to learning using this budget"
            />
          </h4>
          <p>
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.auto.allocate"
              defaultMessage="Funds from this budget are set to auto-allocate to registered learners based on settings configured with your support team."
              description="Description which tells that funds from this budget are set to auto-allocate to registered learners"
            />
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
            <FormattedMessage
              id="lcm.budget.detail.page.overview.budget.actions.contact.support"
              defaultMessage="Contact support"
              description="Contact support button on the budget detail page overview"
            />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center pt-4 pt-lg-0">
      <div>
        <h3>
          <FormattedMessage
            id="lcm.budget.detail.page.overview.budget.actions.lead.learning"
            defaultMessage="Lead the way to learning that matters"
            description="Title for the budget actions section on the budget detail page overview"
          />
        </h3>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.overview.budget.actions.assign.content"
            defaultMessage="Assign content to people using the available budget to cover the cost of enrollment."
            description="Description which tells that content can be assigned to people using the available budget"
          />
        </p>
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
          <FormattedMessage
            id="lcm.budget.detail.page.overview.budget.actions.new.assignment"
            defaultMessage="New assignment"
            description="New assignment button on the budget detail page overview"
          />
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
