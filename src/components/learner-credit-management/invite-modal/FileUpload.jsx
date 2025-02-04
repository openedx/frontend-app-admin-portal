import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dropzone, Form, Icon,
} from '@openedx/paragon';
import { InsertDriveFile } from '@openedx/paragon/icons';

import { formatBytes } from '../../MultipleFileInputField/utils';
import InviteModalInputFeedback from './InviteModalInputFeedback';

const FileUpload = ({ memberInviteMetadata, setEmailAddressesInputValue, setIsCreateGroupFileUpload }) => {
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const UploadedFile = (
    <>
      <div className="pgn__dropzone__upload-icon-wrapper">
        <Icon src={InsertDriveFile} className="pgn__dropzone__upload-icon" />
      </div>
      <p className="h4 text-gray-700">{uploadedFile?.path}</p>
      <p className="small text-gray-500">{formatBytes(uploadedFile?.size)}</p>
    </>
  );

  const handleFileUpload = async ({ fileData }) => {
    const file = fileData.get('file');
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setEmailAddressesInputValue(text);
    };
    reader.readAsText(file);
    if (setIsCreateGroupFileUpload) {
      setIsCreateGroupFileUpload(true);
    }
  };
  return (
    <Form.Group>
      <Dropzone
        onProcessUpload={handleFileUpload}
        maxSize={1048576} // 1MB
        inputComponent={uploadedFile ? UploadedFile : false}
        accept={{
          'text/csv': ['.csv'],
        }}
        errorMessages={{
          invalidType: 'Invalid file type, only csv files allowed.',
          invalidSize: 'The file size must be between below 1MB or 1000 emails.',
          multipleDragged: 'Cannot upload more than one file.',
        }}
      />
      <InviteModalInputFeedback memberInviteMetadata={memberInviteMetadata} isCsvUpload />
    </Form.Group>
  );
};

FileUpload.defaultProps = {
  setIsCreateGroupFileUpload: null,
};

FileUpload.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    validationError: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
  setEmailAddressesInputValue: PropTypes.func.isRequired,
  setIsCreateGroupFileUpload: PropTypes.func,
};

export default FileUpload;
