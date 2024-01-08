import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';
import { ContentCopy } from '@edx/paragon/icons';
import CopiedToast from './CopiedToast';
import { dataPropType } from './constants';

const CopyButton = ({ data }) => {
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const [copiedError, setCopiedError] = useState(false);

  const handleCopyLink = async () => {
    try {
      const newData = data;
      ['user', 'id'].forEach(prop => delete newData[prop]);
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

CopyButton.propTypes = {
  data: PropTypes.shape(dataPropType),
};

export default CopyButton;
