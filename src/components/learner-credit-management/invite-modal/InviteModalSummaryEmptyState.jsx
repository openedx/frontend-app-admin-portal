import React from 'react';
import PropTypes from 'prop-types';

const InviteModalSummaryEmptyState = ({ isGroupInvite }) => {
  if (isGroupInvite) {
    return (
      <>
        <div className="h4 mb-0">You haven&apos;t uploaded any members yet.</div>
        <span className="small">Upload a CSV file or select members to get started.</span>
      </>
    );
  }
  return (
    <>
      <div className="h4 mb-0">You haven&apos;t entered any members yet.</div>
      <span className="small">Add member emails to get started.</span>
    </>
  );
};

InviteModalSummaryEmptyState.propTypes = {
  isGroupInvite: PropTypes.bool,
};

export default InviteModalSummaryEmptyState;
