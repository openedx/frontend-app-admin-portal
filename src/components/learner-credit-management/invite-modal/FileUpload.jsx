import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dropzone, Form, Icon,
} from '@edx/paragon';
import { InsertDriveFile } from '@edx/paragon/icons';

import { formatBytes } from '../../MultipleFileInputField/utils';
import InviteModalInputFeedback from './InviteModalInputFeedback';

const FileUpload = ({ memberInviteMetadata, setEmailAddressesInputValue }) => {
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
      <InviteModalInputFeedback memberInviteMetadata={memberInviteMetadata} />
    </Form.Group>
  );
};

FileUpload.propTypes = {
  memberInviteMetadata: PropTypes.shape({
    validationError: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
  setEmailAddressesInputValue: PropTypes.func.isRequired,
};

export default FileUpload;
