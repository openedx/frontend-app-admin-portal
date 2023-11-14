import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack, Icon } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from '../data';
import AssignmentModalSummaryEmptyState from './AssignmentModalSummaryEmptyState';
import AssignmentModalSummaryLearnerList from './AssignmentModalSummaryLearnerList';
import AssignmentModalSummaryErrorState from './AssignmentModalSummaryErrorState';

const AssignmentModalSummary = ({
  course,
  learnerEmails,
  inputValidationErrorMessage,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const learnerEmailsCount = learnerEmails.length;
  const hasLearnerEmails = learnerEmailsCount > 0;
  const hasInputValidationError = hasLearnerEmails && !!inputValidationErrorMessage;
  const hasValidLearnerEmails = hasLearnerEmails && !hasInputValidationError;
  const totalAssignmentCost = learnerEmailsCount * course.normalizedMetadata.contentPrice;

  const costToAssignLearners = learnerEmails.length * course.normalizedMetadata.contentPrice;
  const spendAvailable = subsidyAccessPolicy.aggregates.spendAvailableUsd;
  const hasEnoughBalanceForAssignment = spendAvailable - costToAssignLearners >= 0;

  let summaryHeading = 'Summary';
  if (hasValidLearnerEmails) {
    summaryHeading = `${summaryHeading} (${learnerEmailsCount})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      <Stack gap={2.5}>
        <Card className={classNames('assignment-modal-summary-card rounded-0 shadow-none', { invalid: hasInputValidationError })}>
          <Card.Section>
            {hasValidLearnerEmails && (
              <AssignmentModalSummaryLearnerList
                course={course}
                learnerEmails={learnerEmails}
              />
            )}
            {hasLearnerEmails && hasInputValidationError && (
              <AssignmentModalSummaryErrorState />
            )}
            {!hasLearnerEmails && (
              <AssignmentModalSummaryEmptyState />
            )}
          </Card.Section>
        </Card>
        {hasValidLearnerEmails && (
          <Card className={classNames('assignment-modal-total-assignment-cost-card rounded-0 shadow-none', { invalid: !hasEnoughBalanceForAssignment })}>
            <Card.Section className="py-2">
              <Stack direction="horizontal" gap={3}>
                {!hasEnoughBalanceForAssignment && <Icon className="text-danger" src={Error} />}
                <Stack direction="horizontal" className="justify-space-between flex-grow-1">
                  <div>Total assignment cost</div>
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

AssignmentModalSummary.propTypes = {
  course: PropTypes.shape({
    normalizedMetadata: PropTypes.shape({
      contentPrice: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AssignmentModalSummary;
