import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import BudgetAssignmentsTable from './BudgetAssignmentsTable';
import AssignMoreCoursesEmptyStateMinimal from './AssignMoreCoursesEmptyStateMinimal';
import {
  getBudgetStatus,
  useBudgetContentAssignments,
  useBudgetId,
  useSubsidyAccessPolicy,
} from './data';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const BudgetDetailAssignmentsHeader = ({
  status,
}) => {
  const assignedHeadingRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const { state: locationState } = location;

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'assigned') {
      assignedHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [navigate, location, locationState]);

  if ([BUDGET_STATUSES.retired, BUDGET_STATUSES.expired].includes(status)) {
    return (
      <>
        <h3 className="mb-3" ref={assignedHeadingRef}>
          <FormattedMessage
            id="lcm.budget.detail.page.incomplete.assignments.heading"
            defaultMessage="Incomplete assignments"
            description="Heading for the incomplete assignments section on the budget detail page"
          />
        </h3>
        {status === BUDGET_STATUSES.retired && (
          <p className="small mb-4 text-info-900">
            <FormattedMessage
              id="lcm.budget.detail.page.incomplete.assignments.description.retired"
              defaultMessage="The assignments below were made before the budget was retired and were never completed by the learner."
              description="Description for the incomplete assignments section on the budget detail page."
            />
          </p>
        )}
        {status === BUDGET_STATUSES.expired && (
          <p className="small mb-4 text-info-900">
            <FormattedMessage
              id="lcm.budget.detail.page.incomplete.assignments.description.expired"
              defaultMessage="The assignments below were made before the budget was expired and were never completed by the learner."
              description="Description for the incomplete assignments section on the budget detail page."
            />
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <h3 className="mb-3" ref={assignedHeadingRef}>
        <FormattedMessage
          id="lcm.budget.detail.page.assignments.heading"
          defaultMessage="Assigned"
          description="Heading for the assigned section on the budget detail page"
        />
      </h3>
      <p className="small mb-4">
        <FormattedMessage
          id="lcm.budget.detail.page.assignments.description"
          defaultMessage="Assigned activity earmarks funds in your budget so you can not overspend.
           For funds to move from assigned to spent, your learners must complete enrollment. <a>Learn more</a>"
          description="Description for the assigned section on the budget detail page. Includes a link to learn more."
          values={{
            // eslint-disable-next-line react/no-unstable-nested-components
            a: (chunks) => (
              <Hyperlink
                destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
                target="_blank"
              >
                {chunks}
              </Hyperlink>
            ),
          }}
        />
      </p>
    </>
  );
};

BudgetDetailAssignmentsHeader.propTypes = {
  status: PropTypes.string.isRequired,
};

const BudgetDetailAssignments = ({
  hasContentAssignments,
  hasSpentTransactions,
  enterpriseFeatures,
  enterpriseId,
}) => {
  const intl = useIntl();
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const isAssignableBudget = !!subsidyAccessPolicy?.isAssignable;
  const assignmentConfigurationUUID = subsidyAccessPolicy?.assignmentConfiguration?.uuid;
  const isTopDownAssignmentEnabled = enterpriseFeatures.topDownAssignmentRealTimeLcm;
  const {
    isLoading,
    contentAssignments,
    fetchContentAssignments,
  } = useBudgetContentAssignments({
    isEnabled: isAssignableBudget && hasContentAssignments,
    assignmentConfigurationUUID,
    enterpriseId,
  });
  const { status } = getBudgetStatus({
    intl,
    startDateStr: subsidyAccessPolicy.subsidyActiveDatetime,
    endDateStr: subsidyAccessPolicy.subsidyExpirationDatetime,
    isBudgetRetired: subsidyAccessPolicy.retired,
  });

  if (!isTopDownAssignmentEnabled || !isAssignableBudget) {
    return null;
  }

  if (!hasContentAssignments && hasSpentTransactions) {
    return (
      <AssignMoreCoursesEmptyStateMinimal />
    );
  }

  return (
    <section className="budget-detail-assignments">
      <BudgetDetailAssignmentsHeader status={status} />
      <BudgetAssignmentsTable
        isLoading={isLoading}
        tableData={contentAssignments}
        fetchTableData={fetchContentAssignments}
        status={status}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailAssignments.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  hasContentAssignments: PropTypes.bool.isRequired,
  hasSpentTransactions: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailAssignments);
