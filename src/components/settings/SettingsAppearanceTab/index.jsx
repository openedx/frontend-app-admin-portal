import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropzone, Toast } from '@edx/paragon';

import InfoHover from '../../InfoHover';
import LmsApiService from '../../../data/services/LmsApiService';

export default function SettingsAppearanceTab({
  enterpriseId,
}) {
  const message = 'Your logo will appear on the upper left of every page for both learners and administrators. For best results, use a rectagular logo that is longer in width and has a transparent or white background.';
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function handleProcessUpload({
    fileData, handleError,
  }) {
    try {
      const formData = new FormData();
      formData.append('logo', fileData.get('file'));
      const response = await LmsApiService.updateEnterpriseCustomerBranding(enterpriseId, fileData);
      if (response.status === 204) {
        setUploadSuccess(response.status);
      }
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <>
      <h2 className="py-2">Portal Appearance</h2>
      <p>
        Customize the appearance of your learner and administrator edX experiences with your
        organization’s logo and color themes.
      </p>
      <h3 className="py-2">
        Logo
        <InfoHover className="" keyName="logo-info-hover" message={message} />
      </h3>
      <Dropzone
        onProcessUpload={handleProcessUpload}
        errorMessages={{
          invalidType: 'Invalid file type, only png images allowed.',
          invalidSize: 'The file size must be under 512 Mb.',
          multipleDragged: 'Cannot upload more than one file.',
        }}
        maxSize={512000}
        accept={{
          'image/*': ['.png'],
        }}
      />
      <Toast
        onClose={() => setUploadSuccess(false)}
        show={uploadSuccess}
      >
        Logo image uploaded successfully.
      </Toast>
    </>
  );
}

SettingsAppearanceTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
