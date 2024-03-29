import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack } from '@openedx/paragon';

import InviteModalSummaryEmptyState from './InviteModalSummaryEmptyState';
import InviteModalSummaryLearnerList from './InviteModalSummaryLearnerList';
import InviteModalSummaryErrorState from './InviteModalSummaryErrorState';
import InviteModalSummaryDuplicate from './InviteModalSummaryDuplicate';

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
  memberInviteMetadata,
}) => {
  const {
    isValidInput,
    lowerCasedEmails,
    duplicateEmails,
  } = memberInviteMetadata;
  const hasLearnerEmails = lowerCasedEmails?.length > 0 && isValidInput;

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${lowerCasedEmails.length})`;
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
              learnerEmails={lowerCasedEmails}
              hasLearnerEmails={hasLearnerEmails}
              hasInputValidationError={!isValidInput}
            />
          </Card.Section>
        </Card>
        {duplicateEmails?.length > 0 && <InviteModalSummaryDuplicate />}
      </Stack>
    </>
  );
};

InviteModalSummaryContents.propTypes = {
  hasLearnerEmails: PropTypes.bool.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string),
  hasInputValidationError: PropTypes.bool.isRequired,
};

InviteModalSummary.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    lowerCasedEmails: PropTypes.arrayOf(PropTypes.string),
    duplicateEmails: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,

};

export default InviteModalSummary;
