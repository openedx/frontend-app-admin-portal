import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Hyperlink } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { dataPropType } from './constants';
import RegenerateCredentialWarningModal from './RegenerateCredentialWarningModal';
import CopyButton from './CopyButton';
import { API_CLIENT_DOCUMENTATION, HELP_CENTER_LINK } from '../data/constants';

const APICredentialsPage = ({ data, setData }) => {
  const [formValue, setFormValue] = useState(data?.redirect_uris);
  const intl = useIntl();

  const handleFormChange = (e) => {
    setFormValue(e.target.value);
  };
  return (
    <div>
      <div className="mb-4">
        <h3>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.header"
            defaultMessage="Your API credentials"
            description="Heading for the API credentials section"
          />
        </h3>
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.copyAndPasteLabel"
            defaultMessage="Copy and paste the following credential information and send it to your API developer(s)."
            description="Instructions to copy and paste API credentials"
          />
        </p>
      </div>
      <div className="mb-4 api-cred-fields">
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.applicationName"
            defaultMessage="Application name:"
            description="Label for application name"
          />
          <span>{data?.name}</span>
        </h4>
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.allowedUris"
            defaultMessage="Allowed URIs:"
            description="Label for allowed URIs"
          />
          <span>{data?.redirect_uris}</span>
        </h4>
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.apiClientId"
            defaultMessage="API client ID:"
            description="Label for API client ID"
          />
          <span>{data?.client_id}</span>
        </h4>
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.apiClientSecret"
            defaultMessage="API client secret:"
            description="Label for API client secret"
          />
          <span>{data?.client_secret}</span>
        </h4>
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.apiClientDocumentation"
            defaultMessage="API client documentation:"
            description="Label for API client documentation"
          />
          <span>{API_CLIENT_DOCUMENTATION}</span>
        </h4>
        <h4>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.lastGeneratedOn"
            defaultMessage="Last generated on: <span>{lastUpdatedate}</span>"
            description="Label for the last generated date of API credentials"
            values={{
              lastUpdatedate: data?.updated,
              // eslint-disable-next-line react/no-unstable-nested-components
              span: (chunks) => <span>{chunks}</span>,
            }}
          />
        </h4>
        <div className="my-3">
          <CopyButton data={data} />
        </div>
      </div>
      <div className="my-5">
        <h3>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.redirectUris"
            defaultMessage="Redirect URIs (optional)"
            description="Heading for the optional redirect URIs section"
          />
        </h3>
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.additionalRedirectUris"
            defaultMessage="If you need additional redirect URIs, add them below and regenerate your API credentials. You will need to communicate the new credentials to your API developers."
            description="Instructions for adding additional redirect URIs and regenerating API credentials"
          />
        </p>
        <Form.Control
          value={formValue}
          onChange={handleFormChange}
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.apiCredentialsTab.apiCredentialsPage.redirectUrisLabel',
            defaultMessage: 'Redirect URIs',
            description: 'Label for the redirect URIs input field',
          })}
          data-testid="form-control"
        />
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.allowedUrisList"
            defaultMessage="Allowed URIs list, space separated"
            description="Text indicating how to list allowed URIs"
          />
        </p>
        <RegenerateCredentialWarningModal
          redirectURIs={formValue}
          data={data}
          setData={setData}
        />
      </div>
      <div className="mb-4">
        <h3>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.questionsOrModifications"
            defaultMessage="Questions or modifications?"
            description="Heading for the questions or modifications section"
          />
        </h3>
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.apiCredentialsPage.troubleshootOrRequest"
            defaultMessage="To troubleshoot your API credentialing, or to request additional API endpoints to your credentials, <a>contact Enterprise Customer Support.</a>"
            description="Instructions for troubleshooting or requesting modifications to API credentials"
            values={{
              // eslint-disable-next-line react/no-unstable-nested-components
              a: chunks => (
                <Hyperlink
                  variant="muted"
                  destination={HELP_CENTER_LINK}
                  target="_blank"
                >
                  {chunks}
                </Hyperlink>
              ),
            }}
          />
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
