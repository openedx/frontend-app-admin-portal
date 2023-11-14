import React from 'react';
import PropTypes from 'prop-types';
import { Card, Stack } from '@edx/paragon';

import { formatPrice } from '../data';
import AssignmentModalSummaryEmptyState from './AssignmentModalSummaryEmptyState';
import AssignmentModalSummaryLearnerList from './AssignmentModalSummaryLearnerList';

const AssignmentModalSummary = ({
  course,
  learnerEmails,
}) => {
  const learnerEmailsCount = learnerEmails.length;
  const hasLearnerEmails = learnerEmailsCount > 0;
  const totalAssignmentCost = learnerEmailsCount * course.normalizedMetadata.contentPrice;

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${learnerEmailsCount})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      <Stack gap={2.5}>
        <Card className="rounded-0 shadow-none">
          <Card.Section className="py-2">
            {hasLearnerEmails ? (
              <AssignmentModalSummaryLearnerList
                course={course}
                learnerEmails={learnerEmails}
              />
            ) : (
              <AssignmentModalSummaryEmptyState />
            )}
          </Card.Section>
        </Card>
        {hasLearnerEmails && (
          <Card className="rounded-0 shadow-none">
            <Card.Section className="d-flex justify-content-between py-2">
              <div>Total assignment cost</div>
              <div>{formatPrice(totalAssignmentCost)}</div>
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
