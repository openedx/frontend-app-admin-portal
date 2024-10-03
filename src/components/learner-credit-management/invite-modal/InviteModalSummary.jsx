import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack } from '@openedx/paragon';
import isEmpty from 'lodash/isEmpty';

import InviteModalSummaryEmptyState from './InviteModalSummaryEmptyState';
import InviteModalSummaryLearnerList from './InviteModalSummaryLearnerList';
import InviteModalSummaryErrorState from './InviteModalSummaryErrorState';
import InviteModalSummaryDuplicate from './InviteModalSummaryDuplicate';

const InviteModalSummary = ({
  memberInviteMetadata,
  isGroupsInvite,
}) => {
  const {
    isValidInput,
    lowerCasedEmails,
    duplicateEmails,
  } = memberInviteMetadata;
  const renderCard = (contents, showErrorHighlight) => (
    <Stack gap={2.5} className="mb-4">
      <Card
        className={classNames(
          'invite-modal-summary-card rounded-0 shadow-none',
          { invalid: showErrorHighlight && !isValidInput },
        )}
      >
        <Card.Section>
          {contents}
        </Card.Section>
      </Card>
    </Stack>
  );

  const hasLearnerEmails = lowerCasedEmails?.length > 0;
  let cardSections = [];
  if (hasLearnerEmails) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryLearnerList learnerEmails={lowerCasedEmails} />),
    );
  }

  if (!isValidInput) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryErrorState />, true),
    );
  }

  if (isEmpty(cardSections)) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryEmptyState isGroupsInvite/>),
    );
  }

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${lowerCasedEmails.length})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      {cardSections}
      {duplicateEmails?.length > 0 && <InviteModalSummaryDuplicate />}
    </>
  );
};

InviteModalSummary.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    lowerCasedEmails: PropTypes.arrayOf(PropTypes.string),
    duplicateEmails: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,

};

export default InviteModalSummary;
