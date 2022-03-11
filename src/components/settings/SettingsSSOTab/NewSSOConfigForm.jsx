import { Form } from '@edx/paragon';
import React, { useState } from 'react';

const NewSSOConfigForm = () => {
  const [metadataMethod, setMetadataMethod] = useState('url'); // vs 'fileupload' in future
  const [metadataURL, setMetadataURL] = useState('');
  const handleMetadataUpdate = (event) => setMetadataMethod(event.target.value);
  const handleMetadataURLChange = (event) => setMetadataURL(event.target.value);
  const TITLE = 'First, select the way to provide your Identity Provider Metadata and fill out the corresponding fields. ';
  return (
    <div>
      {TITLE}

      <div className="sso-create-form mt-4.5 d-flex">
        <Form.Group>
          <Form.RadioSet
            name="metadataFetchMethod"
            onChange={handleMetadataUpdate}
            value={metadataMethod}
          >
            <Form.Radio className="mb-3" value="url" placeholder="">Provide URL</Form.Radio>
            <Form.Control
              className="sso-create-form-control mb-4"
              type="text"
              onChange={handleMetadataURLChange}
              floatingLabel="Identity Provider Metadata URL"
              defaultValue={metadataURL}
            />
          </Form.RadioSet>
        </Form.Group>
      </div>
    </div>
  );
};
export default NewSSOConfigForm;
