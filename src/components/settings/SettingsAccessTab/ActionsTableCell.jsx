import React, { useState } from 'react';
import { ActionRow, Button } from '@edx/paragon';
import PropTypes from 'prop-types';
import LinkDeactivationAlertModal from './LinkDeactivationAlertModal';

const ActionsTableCell = ({ row, onDeactivateLink }) => {
  const [isLinkDeactivationModalOpen, setIsLinkDeactivationModalOpen] = useState(false);
  const { isActive } = row.original;
  if (!isActive) {
    return null;
  }
  const handleCopyLink = () => {
    // TODO: Handle Copy link to clipboard
    // console.log('handleCopyLink', row);
  };

  const handleDeactivateClick = () => {
    setIsLinkDeactivationModalOpen(true);
  };

  const closeLinkDeactivationModal = () => {
    setIsLinkDeactivationModalOpen(false);
  };

  const handleLinkDeactivated = () => {
    if (onDeactivateLink) {
      onDeactivateLink(row);
    }
    closeLinkDeactivationModal();
  };

  return (
    <>
      <div className="d-flex justify-content-end">
        <ActionRow>
          <Button onClick={() => handleCopyLink()} variant="link" size="inline">Copy</Button>
          <Button onClick={() => handleDeactivateClick()} variant="link" size="inline">Deactivate</Button>
        </ActionRow>
      </div>
      <LinkDeactivationAlertModal
        isOpen={isLinkDeactivationModalOpen}
        onClose={closeLinkDeactivationModal}
        onDeactivateLink={handleLinkDeactivated}
      />
    </>
  );
};

ActionsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      isActive: PropTypes.bool,
    }),
  }).isRequired,
  onDeactivateLink: PropTypes.func,
};

ActionsTableCell.defaultProps = {
  onDeactivateLink: undefined,
};

export default ActionsTableCell;
