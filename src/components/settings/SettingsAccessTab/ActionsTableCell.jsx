import React, { useState } from 'react';
import { ActionRow, Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import LinkDeactivationAlertModal from './LinkDeactivationAlertModal';
import LinkCopiedToast from './LinkCopiedToast';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';
import getInviteURL from './utils';

const ActionsTableCell = ({
  row,
  onDeactivateLink,
  enterpriseUUID,
  enterpriseSlug,
}) => {
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
      const inviteURL = getInviteURL(enterpriseSlug, inviteKeyUUID);
      try {
        await navigator.clipboard.writeText(inviteURL);
        setIsCopyLinkToastOpen(true);
      } catch (error) {
        logError(error);
      }
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_COPIED,
        { invite_key_uuid: inviteKeyUUID },
      );
    };
    addToClipboard();
  };

  const handleDeactivateClick = () => {
    setIsLinkDeactivationModalOpen(true);
    sendEnterpriseTrackEvent(
      enterpriseUUID,
      SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_DEACTIVATE,
      { invite_key_uuid: inviteKeyUUID },
    );
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
            <Button onClick={handleCopyLink} variant="link" size="inline">
              <FormattedMessage
                id="adminPortal.settings.access.copyLink"
                defaultMessage="Copy"
                description="Label for the copy link button."
              />
            </Button>
          )}
          <Button onClick={handleDeactivateClick} variant="link" size="inline">
            <FormattedMessage
              id="adminPortal.settings.access.deactivateLink"
              defaultMessage="Deactivate"
              description="Label for the deactivate link button."
            />
          </Button>
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
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

ActionsTableCell.defaultProps = {
  onDeactivateLink: undefined,
};

export default ActionsTableCell;
