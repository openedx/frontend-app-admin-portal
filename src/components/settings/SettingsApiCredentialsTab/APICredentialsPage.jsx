import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Form, Hyperlink } from '@edx/paragon';
import { dataPropType } from './constants';
import RegenerateCredentialWarningModal from './RegenerateCredentialWarningModal';
import CopyButton from './CopyButton';
import { API_CLIENT_DOCUMENTATION, HELP_CENTER_LINK } from '../data/constants';

const APICredentialsPage = ({ data, setData }) => {
  const [formValue, setFormValue] = useState(data?.redirect_uris);
  const handleFormChange = (e) => {
    setFormValue(e.target.value);
  };
  return (
    <div>
      <div className="mb-4">
        <h3>Your API credentials</h3>
        <p>
          Copy and paste the following credential information and send it to your API developer(s).
        </p>
      </div>
      <div className="mb-4 api-cred-fields">
        <h4>
          Application name:
          <span>{data?.name}</span>
        </h4>
        <h4>
          Allowed URIs:
          <span>{data?.redirect_uris}</span>
        </h4>
        <h4>
          API client ID:
          <span>{data?.client_id}</span>
        </h4>
        <h4>
          API client secret:
          <span>{data?.client_secret}</span>
        </h4>
        <h4>API client documentation:
          <span>{API_CLIENT_DOCUMENTATION}</span>
        </h4>
        <h4>
          Last generated on:
          <span>{data?.updated}</span>
        </h4>
        <div className="my-3">
          <CopyButton data={data} />
        </div>
      </div>
      <div className="my-5">
        <h3>Redirect URIs (optional)</h3>
        <p>
          If you need additional redirect URIs, add them below and regenerate your API credentials.
          You will need to communicate the new credentials to your API developers.
        </p>
        <Form.Control
          value={formValue}
          onChange={handleFormChange}
          floatingLabel="Redirect URIs"
          data-testid="form-control"
        />
        <p>
          Allowed URIs list, space separated
        </p>
        <RegenerateCredentialWarningModal
          redirectURIs={formValue}
          data={data}
          setData={setData}
        />
      </div>
      <div className="mb-4">
        <h3>Questions or modifications?</h3>
        <p>
          To troubleshoot your API credentialing, or to request additional API endpoints to your
          credentials,&nbsp;
          <Hyperlink
            variant="muted"
            destination={HELP_CENTER_LINK}
            target="_blank"
          >
            contact Enterprise Customer Support.
          </Hyperlink>
        </p>
      </div>
    </div>
  );
};

APICredentialsPage.defaultProps = {
  data: null,
};

APICredentialsPage.propTypes = {
  data: PropTypes.shape(dataPropType),
  setData: PropTypes.func.isRequired,
};

export default APICredentialsPage;
