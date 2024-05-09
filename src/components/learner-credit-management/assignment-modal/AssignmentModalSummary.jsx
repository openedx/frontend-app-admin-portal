import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack, Icon } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { formatPrice } from '../data';
import AssignmentModalSummaryEmptyState from './AssignmentModalSummaryEmptyState';
import AssignmentModalSummaryLearnerList from './AssignmentModalSummaryLearnerList';
import AssignmentModalSummaryErrorState from './AssignmentModalSummaryErrorState';

const AssignmentModalSummaryContents = ({
  hasLearnerEmails,
  learnerEmails,
  course,
  hasInputValidationError,
}) => {
  if (hasLearnerEmails) {
    return (
      <AssignmentModalSummaryLearnerList
        course={course}
        learnerEmails={learnerEmails}
      />
    );
  }
  if (hasInputValidationError) {
    return <AssignmentModalSummaryErrorState />;
  }
  return <AssignmentModalSummaryEmptyState />;
};

const AssignmentModalSummary = ({
  course,
  learnerEmails,
  assignmentAllocationMetadata,
}) => {
  const intl = useIntl();
  const {
    isValidInput,
    learnerEmailsCount,
    totalAssignmentCost,
    hasEnoughBalanceForAssignment,
  } = assignmentAllocationMetadata;
  const hasLearnerEmails = learnerEmailsCount > 0 && isValidInput;

  let summaryHeading = intl.formatMessage({
    id: 'lcm.budget.detail.page.catalog.tab.course.card.summary',
    defaultMessage: 'Summary',
    description: 'Heading for the summary section of the assignment modal',
  });
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${learnerEmailsCount})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      <Stack gap={2.5}>
        <Card
          className={classNames(
            'assignment-modal-summary-card rounded-0 shadow-none',
            { invalid: !isValidInput },
          )}
        >
          <Card.Section>
            <AssignmentModalSummaryContents
              learnerEmails={learnerEmails}
              hasLearnerEmails={hasLearnerEmails}
              course={course}
              hasInputValidationError={!isValidInput}
            />
          </Card.Section>
        </Card>
        {hasLearnerEmails && (
          <Card
            className={classNames(
              'assignment-modal-total-assignment-cost-card rounded-0 shadow-none',
              { invalid: !hasEnoughBalanceForAssignment },
            )}
          >
            <Card.Section className="py-2">
              <Stack direction="horizontal" gap={3}>
                {!hasEnoughBalanceForAssignment && <Icon className="text-danger" src={Error} />}
                <Stack direction="horizontal" className="justify-space-between flex-grow-1">
                  <div>
                    <FormattedMessage
                      id="lcm.budget.detail.page.catalog.tab.course.card.total.assignment.cost"
                      defaultMessage="Total assignment cost"
                      description="Label for the total assignment cost in the assignment modal"
                    />
                  </div>
                  <div className="ml-auto">{formatPrice(totalAssignmentCost)}</div>
                </Stack>
              </Stack>
            </Card.Section>
          </Card>
        )}
      </Stack>
    </>
  );
};

AssignmentModalSummaryContents.propTypes = {
  hasLearnerEmails: PropTypes.bool.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  course: PropTypes.shape().isRequired, // pass-thru prop to child component(s)
  hasInputValidationError: PropTypes.bool.isRequired,
};

AssignmentModalSummary.propTypes = {
  course: PropTypes.shape().isRequired, // pass-thru prop to child component(s)
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  assignmentAllocationMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    learnerEmailsCount: PropTypes.number,
    totalAssignmentCost: PropTypes.number,
    hasEnoughBalanceForAssignment: PropTypes.bool,
  }).isRequired,
};

export default AssignmentModalSummary;
