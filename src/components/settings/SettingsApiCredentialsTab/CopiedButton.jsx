import React, { useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { Button } from '@edx/paragon';
import { ContentCopy } from '@edx/paragon/icons';
import CopiedToast from './CopiedToast';

const CopiedButton = (api_credentials) => {
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const hasClipboard = !!navigator.clipboard;
  const addToClipboard = async (data) => {
    try {
      await navigator.clipboard.writeText(data);
      setIsCopyLinkToastOpen(true);
    } catch (error) {
      logError(error);
    }
  };
  const handleCopyLink = () => {
    if (!hasClipboard) {
      return;
    }
    const jsonString = JSON.stringify(api_credentials);
    addToClipboard(jsonString);
  };
  const handleCloseLinkCopyToast = () => {
    setIsCopyLinkToastOpen(false);
  };
  return (
    <>
      <Button
        variant="primary"
        iconAfter={ContentCopy}
        onClick={handleCopyLink}
      >
        Copy credentials to clipboard
      </Button>
      <CopiedToast content="Copied Successfully" show={isCopyLinkToastOpen} onClose={handleCloseLinkCopyToast} />
    </>
  );
};

export default CopiedButton;
