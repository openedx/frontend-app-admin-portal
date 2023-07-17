import React, { useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { Button } from '@edx/paragon';
import { ContentCopy } from '@edx/paragon/icons';
import CopiedToast from './CopiedToast';

const CopiedButton = () => {
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const hasClipboard = !!navigator.clipboard;
  const text = [];
  const addToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopyLinkToastOpen(true);
    } catch (error) {
      logError(error);
    }
  };
  const handleCopyLink = () => {
    if (!hasClipboard) {
      return;
    }
    addToClipboard();
  };
  const handleCloseLinkCopyToast = () => {
    setIsCopyLinkToastOpen(false);
  };
  return (
    <div>
      <Button
        variant="primary"
        iconAfter={ContentCopy}
        onClick={handleCopyLink}
      >
        Copy credentials to clipboard
      </Button>
      <CopiedToast content="Copied" show={isCopyLinkToastOpen} onClose={handleCloseLinkCopyToast} />
    </div>
  );
};

export default CopiedButton;
