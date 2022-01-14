import React, { useState } from 'react';
import { ActionRow, Button } from '@edx/paragon';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

import LinkDeactivationAlertModal from './LinkDeactivationAlertModal';
import LinkCopiedToast from './LinkCopiedToast';

const ActionsTableCell = ({ row, onDeactivateLink }) => {
  const [isLinkDeactivationModalOpen, setIsLinkDeactivationModalOpen] = useState(false);
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const { isValid, uuid: inviteKeyUUID } = row.original;
  const hasClipboard = !!navigator.clipboard;

  if (!isValid) {
    return null;
  }

  const handleCopyLink = () => {
    if (!hasClipboard) {
      return;
    }
    const addToClipboard = async () => {
      const inviteURL = `${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/invite/${inviteKeyUUID}`;
      try {
        await navigator.clipboard.writeText(inviteURL);
        setIsCopyLinkToastOpen(true);
      } catch (error) {
        logError(error);
      }
    };
    addToClipboard();
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

  const handleCloseLinkCopyToast = () => {
    setIsCopyLinkToastOpen(false);
  };

  return (
    <>
      <div className="d-flex justify-content-end">
        <ActionRow>
          {hasClipboard && (
            <Button onClick={handleCopyLink} variant="link" size="inline">Copy</Button>
          )}
          <Button onClick={handleDeactivateClick} variant="link" size="inline">Deactivate</Button>
        </ActionRow>
      </div>
      <LinkDeactivationAlertModal
        isOpen={isLinkDeactivationModalOpen}
        onClose={closeLinkDeactivationModal}
        onDeactivateLink={handleLinkDeactivated}
        inviteKeyUUID={inviteKeyUUID}
      />
      <LinkCopiedToast show={isCopyLinkToastOpen} onClose={handleCloseLinkCopyToast} />
    </>
  );
};

ActionsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      isValid: PropTypes.bool,
      uuid: PropTypes.string,
    }),
  }).isRequired,
  onDeactivateLink: PropTypes.func,
};

ActionsTableCell.defaultProps = {
  onDeactivateLink: undefined,
};

export default ActionsTableCell;
