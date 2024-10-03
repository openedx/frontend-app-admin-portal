import React from 'react';

const InviteModalSummaryEmptyState = ({ isGroupsInvite }) => {
  if (isGroupsInvite) {
    return (
      <>
        <div className="h4 mb-0">You haven&apos;t uploaded any members yet.</div>
        <span className="small">Upload a CSV file or select members to get started.</span>
      </>
    )
  }
  return (
    <>
      <div className="h4 mb-0">You haven&apos;t entered any members yet.</div>
      <span className="small">Add member emails to get started.</span>
    </>
  )
};

export default InviteModalSummaryEmptyState;
