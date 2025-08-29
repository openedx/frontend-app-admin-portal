import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { LearnerEmailsValidityReport } from '../cards/data';

type InviteSummaryCountProps = {
  memberInviteMetadata: LearnerEmailsValidityReport
};

const InviteSummaryCount = ({ memberInviteMetadata }: InviteSummaryCountProps) => (
  <Card className="mt-2 d-flex px-3 py-2 rounded-0 shadow-none">
    <Card.Footer className="p-0 justify-content-between" orientation="horizontal">
      <span>
        Total members to add
      </span>
      <span>{memberInviteMetadata?.validatedEmails?.length}</span>
    </Card.Footer>
  </Card>
);

InviteSummaryCount.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    validatedEmails: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default InviteSummaryCount;
