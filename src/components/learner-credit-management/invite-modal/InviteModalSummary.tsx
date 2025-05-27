import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Stack } from '@openedx/paragon';
import { isEmpty } from 'lodash-es';

import InviteModalSummaryEmptyState from './InviteModalSummaryEmptyState';
import InviteModalSummaryLearnerList from './InviteModalSummaryLearnerList';
import InviteModalSummaryErrorState from './InviteModalSummaryErrorState';
import InviteModalSummaryDuplicate from './InviteModalSummaryDuplicate';
import { LearnerEmailsValidityReport } from '../cards/data';

type InviteModalSummaryProps = {
  memberInviteMetadata: LearnerEmailsValidityReport
  isGroupInvite: boolean,
};

const InviteModalSummary = ({
  memberInviteMetadata,
  isGroupInvite,
}: InviteModalSummaryProps) => {
  const {
    isValidInput,
    validatedEmails,
    duplicateEmails,
  } = memberInviteMetadata;
  const renderCard = (contents, showErrorHighlight = false): ReactElement => (
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

  const hasLearnerEmails = validatedEmails?.length > 0;
  let cardSections = [] as ReactElement[];
  if (hasLearnerEmails) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryLearnerList learnerEmails={validatedEmails} />),
    );
  }

  if (!isValidInput) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryErrorState />, true),
    );
  }

  if (isEmpty(cardSections)) {
    cardSections = cardSections.concat(
      renderCard(<InviteModalSummaryEmptyState isGroupInvite={isGroupInvite} />),
    );
  }

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${validatedEmails.length})`;
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
    validatedEmails: PropTypes.arrayOf(PropTypes.string),
    duplicateEmails: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isGroupInvite: PropTypes.bool,
};

export default InviteModalSummary;
