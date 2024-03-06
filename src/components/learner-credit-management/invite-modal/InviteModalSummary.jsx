import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack } from '@edx/paragon';

import InviteModalSummaryEmptyState from './InviteModalSummaryEmptyState';
import InviteModalSummaryLearnerList from './InviteModalSummaryLearnerList';
import InviteModalSummaryErrorState from './InviteModalSummaryErrorState';

const InviteModalSummaryContents = ({
  hasLearnerEmails,
  learnerEmails,
  hasInputValidationError,
}) => {
  if (hasLearnerEmails) {
    return (
      <InviteModalSummaryLearnerList
        learnerEmails={learnerEmails}
      />
    );
  }
  if (hasInputValidationError) {
    return <InviteModalSummaryErrorState />;
  }
  return <InviteModalSummaryEmptyState />;
};

const InviteModalSummary = ({
  learnerEmails,
  memberInviteMetadata,
}) => {
  const {
    isValidInput,
    learnerEmailsCount,
  } = memberInviteMetadata;
  const hasLearnerEmails = learnerEmailsCount > 0 && isValidInput;

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${learnerEmailsCount})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      <Stack gap={2.5}>
        <Card
          className={classNames(
            'invite-modal-summary-card rounded-0 shadow-none',
            { invalid: !isValidInput },
          )}
        >
          <Card.Section>
            <InviteModalSummaryContents
              learnerEmails={learnerEmails}
              hasLearnerEmails={hasLearnerEmails}
              hasInputValidationError={!isValidInput}
            />
          </Card.Section>
        </Card>
      </Stack>
    </>
  );
};

InviteModalSummaryContents.propTypes = {
  hasLearnerEmails: PropTypes.bool.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  hasInputValidationError: PropTypes.bool.isRequired,
};

InviteModalSummary.propTypes = {
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  memberInviteMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    learnerEmailsCount: PropTypes.number,
  }).isRequired,
};

export default InviteModalSummary;
