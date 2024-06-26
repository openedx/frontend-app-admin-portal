import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Hyperlink, Button, Row,
} from '@openedx/paragon';
import { Info, Download } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import { createSAMLURLs } from '../utils';
import { SSOConfigContext } from '../SSOConfigContext';
import { FormFieldValidation, useFormContext } from '../../../forms/FormContext';
import ValidatedFormCheckbox from '../../../forms/ValidatedFormCheckbox';

const messages = defineMessages({
  markedAuthorized: {
    id: 'adminPortal.settings.ssoConfigAuthorizeStep.markedAuthorized',
    defaultMessage: 'Please verify authorization of edX as a Service Provider.',
    description: 'Helper message displayed against the option to verify authorization of edX as a Service Provider.',
  },
});

export const getValidations = (intl) : FormFieldValidation[] => [
  {
    formFieldId: 'markedAuthorized',
    validator: (fields) => {
      const ret = !fields.markedAuthorized && intl.formatMessage(messages.markedAuthorized);
      return ret;
    },
  },
];

// TODO: Move with SSOConfigContext
type SSOProviderConfig = {
  slug: string;
};

type SSOState = {
  providerConfig?: SSOProviderConfig;
};

type SSOConfigContextValue = {
  ssoState?: SSOState;
};

const SSOConfigAuthorizeStep = () => {
  const configuration = getConfig();
  const {
    ssoState,
  } = useContext<SSOConfigContextValue>(SSOConfigContext);
  const {
    formFields,
  } = useFormContext();
  const { enterpriseSlug } = useParams();

  const idpSlug = ssoState?.providerConfig?.slug;
  const learnerPortalEnabled = ssoState?.providerConfig?.slug;

  const { testLink } = createSAMLURLs({
    configuration, idpSlug, enterpriseSlug, learnerPortalEnabled,
  });
  
  const linkToDownloadMetadataXML =
    formFields?.spMetadataUrl ||
    `${configuration.EDX_ACCESS_URL}/samlp/metadata?connection=${enterpriseSlug}-${formFields?.uuid}`;

  return (
    <>
      <h2>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.authorizeEdX.title"
          defaultMessage="Authorize edX as a Service Provider"
          description="Title for authorizing edX as a Service Provider"
        />
      </h2>
      <Alert variant="info" className="mb-4" icon={Info}>
        <h3>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigAuthorizeStep.actionRequired"
            defaultMessage="Action required in a new window"
            description="Action required message for authorizing edX as a Service Provider"
          />
        </h3>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.actionRequiredInstructions"
          defaultMessage="Return to this window after completing the following steps in a new window to finish configuring your integration."
          description="Action required instructions for authorizing edX as a Service Provider"
        />
      </Alert>
      <hr />
      <p>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.downloadMetadata"
          defaultMessage="1. Download the edX Service Provider metadata as an XML file:"
          description="2 part instructions to setup edX Service Provider, This is the first part"
        />
      </p>
      <Row className="justify-content-center mb-4 ">
        <Button as="a" href={linkToDownloadMetadataXML} target="_blank" rel="noopener noreferrer" variant="primary" iconAfter={Download}>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigAuthorizeStep.downloadMetadataButton"
            defaultMessage="edX Service Provider Metadata"
            description="Button text to download edX Service Provider metadata"
          />
        </Button>
      </Row>

      <p>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.uploadMetadata"
          defaultMessage="2. {downloadLink} and upload the XML file to the list of authorized SAML Service Providers on your Identity Provider's portal or website."
          description="2 part instructions to setup edX Service Provider, This is the second part"
          values={{
            downloadLink: (
              <Hyperlink destination={testLink} target="_blank" rel="noopener noreferrer">
                <FormattedMessage
                  id="adminPortal.settings.ssoConfigAuthorizeStep.downloadMetadataLink"
                  defaultMessage="Launch a new window"
                  description="Link text to download edX Service Provider metadata"
                />
              </Hyperlink>
            ),
          }}
        />
      </p>
      <hr />
      <p>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.markedAuthorized"
          defaultMessage="Return to this window and check the box once complete"
          description="Helper message displayed against the option to verify authorization of edX as a Service Provider."
        />
      </p>
      <ValidatedFormCheckbox className="mt-4" formId="markedAuthorized">
        <FormattedMessage
          id="adminPortal.settings.ssoConfigAuthorizeStep.markedAuthorizedCheckbox"
          defaultMessage="I have authorized edX as a Service Provider"
          description="Checkbox to verify authorization of edX as a Service Provider"
        />
      </ValidatedFormCheckbox>
    </>
  );
};

export default SSOConfigAuthorizeStep;
