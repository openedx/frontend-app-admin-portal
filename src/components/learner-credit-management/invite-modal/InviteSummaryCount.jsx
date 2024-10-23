import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';

const InviteSummaryCount = ({ memberInviteMetadata }) => (
  <Card className="d-flex px-3 py-2 rounded-0 shadow-none">
    <Card.Footer className="p-0 justify-content-between" orientation="horizontal">
      <span>
        Total members to add
      </span>
      <span>{memberInviteMetadata.lowerCasedEmails.length}</span>
    </Card.Footer>
  </Card>
);

InviteSummaryCount.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    lowerCasedEmails: PropTypes.arrayOf(PropTypes.string),
    duplicateEmails: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default InviteSummaryCount;
