import React, { useContext, useState } from 'react';
import { Button } from '@edx/paragon';
import { ContentCopy } from '@edx/paragon/icons';
import CopiedToast from './CopiedToast';
import { DataContext } from './Context';

const CopiedButton = () => {
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const [data] = useContext(DataContext);
  const [copiedError, setCopiedError] = useState(false);

  const handleCopyLink = async () => {
    try {
      const jsonString = JSON.stringify(data);
      await navigator.clipboard.writeText(jsonString);
    } catch (error) {
      setCopiedError(true);
    } finally {
      setIsCopyLinkToastOpen(true);
    }
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
      <CopiedToast
        content={copiedError ? 'Cannot copied to the clipboard' : 'Copied Successfully'}
        show={isCopyLinkToastOpen}
        onClose={handleCloseLinkCopyToast}
      />
    </>
  );
};

export default CopiedButton;
