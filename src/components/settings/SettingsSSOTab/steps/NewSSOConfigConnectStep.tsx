import React, { useState } from 'react';
import {
  Container, Dropzone, Form,
} from '@openedx/paragon';

import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ValidatedFormRadio from '../../../forms/ValidatedFormRadio';
import ValidatedFormControl from '../../../forms/ValidatedFormControl';
import { FormContext, FormFieldValidation, useFormContext } from '../../../forms/FormContext';
import { setFormFieldAction } from '../../../forms/data/actions';
import { urlValidation } from '../../../../utils';

export const IDP_URL_SELECTION = 'idp_metadata_url';
export const IDP_XML_SELECTION = 'idp_metadata_xml';
const urlEntrySelected = (formFields) => formFields?.idpConnectOption === IDP_URL_SELECTION;
const xmlEntrySelected = (formFields) => formFields?.idpConnectOption === IDP_XML_SELECTION;

const messages = defineMessages({
  identityProvider: {
    id: 'adminPortal.settings.ssoConfigConnectStep.identityProvider',
    defaultMessage: 'Please select an SSO Identity Provider',
    description: 'Helper message displayed against the option to select an SSO Identity Provider.',
  },
  idpConnectOption: {
    id: 'adminPortal.settings.ssoConfigConnectStep.idpConnectOption',
    defaultMessage: 'Please select a connection method',
    description: 'Helper message displayed against the option to select a connection method.',
  },
  metadataUrl: {
    id: 'adminPortal.settings.ssoConfigConnectStep.metadataUrl',
    defaultMessage: 'Please enter an Identity Provider Metadata URL',
    description: 'Helper message displayed against the option to enter an Identity Provider Metadata URL.',
  },
  metadataXml: {
    id: 'adminPortal.settings.ssoConfigConnectStep.metadataXml',
    defaultMessage: 'Please upload an Identity Provider Metadata XML file',
    description: 'Helper message displayed against the option to upload an Identity Provider Metadata XML file.',
  },
  other: {
    id: 'adminPortal.settings.ssoConfigConnectStep.other',
    defaultMessage: 'Other',
    description: 'Other identity provider option.',
  },
  enterMetadataUrl: {
    id: 'adminPortal.settings.ssoConfigConnectStep.enterMetadataUrl',
    defaultMessage: 'Enter identity Provider Metadata URL',
    description: 'Option to enter Identity Provider Metadata URL.',
  },
  uploadMetadataXml: {
    id: 'adminPortal.settings.ssoConfigConnectStep.uploadMetadataXml',
    defaultMessage: 'Upload Identity Provider Metadata XML file',
    description: 'Option to upload Identity Provider Metadata XML file.',
  },
  invalidType: {
    id: 'adminPortal.settings.ssoConfigConnectStep.invalidType',
    defaultMessage: 'Invalid file type, only xml images allowed.',
    description: 'Error message displayed when an invalid file type is uploaded.',
  },
  invalidSize: {
    id: 'adminPortal.settings.ssoConfigConnectStep.invalidSize',
    defaultMessage: 'The file size must be under 5 gb.',
    description: 'Error message displayed when the uploaded file size exceeds the limit.',
  },
  multipleDragged: {
    id: 'adminPortal.settings.ssoConfigConnectStep.multipleDragged',
    defaultMessage: 'Cannot upload more than one file.',
    description: 'Error message displayed when more than one file is uploaded.',
  },
});

export const getValidations = (intl) : FormFieldValidation[] => [
  {
    formFieldId: 'identityProvider',
    validator: (fields) => !fields.identityProvider && intl.formatMessage(messages.identityProvider),
  },
  {
    formFieldId: 'idpConnectOption',
    validator: (fields) => !fields.idpConnectOption && intl.formatMessage(messages.idpConnectOption),
  },
  {
    formFieldId: 'metadataUrl',
    validator: (fields) => {
      const error = urlEntrySelected(fields) && !urlValidation(fields.metadataUrl);
      return error && intl.formatMessage(messages.metadataUrl);
    },
  },
  {
    formFieldId: 'metadataXml',
    validator: (fields) => {
      const error = !fields.metadataXml && xmlEntrySelected(fields);
      return error && intl.formatMessage(messages.metadataXml);
    },
  },
];

const SSOConfigConnectStep = () => {
  const {
    formFields, dispatch, showErrors, errorMap,
  }: FormContext = useFormContext();
  const [xmlUploadFileName, setXmlUploadFileName] = useState('');
  const intl = useIntl();
  const showUrlEntry = urlEntrySelected(formFields);
  const showXmlUpload = xmlEntrySelected(formFields);
  const xmlUploadError = errorMap?.metadataXml;

  const onUploadXml = ({ fileData }) => {
    const blob = fileData.get('file');
    blob.text().then(xmlText => {
      dispatch?.(setFormFieldAction({ fieldId: 'metadataXml', value: xmlText }));
      setXmlUploadFileName(blob.name);
    });
  };

  const fiveGbInBytes = 5368709120;
  const ssoIdpOptions = [
    ['Microsoft Entra ID', 'microsoft_entra_id'],
    ['Google Workspace', 'google_workspace'],
    ['Okta', 'okta'],
    ['OneLogin', 'one_login'],
    ['SAP SuccessFactors', 'sap_success_factors'],
    [intl.formatMessage(messages.other), 'other'],
  ];
  const idpConnectOptions = [
    [intl.formatMessage(messages.enterMetadataUrl), IDP_URL_SELECTION],
    [intl.formatMessage(messages.uploadMetadataXml), IDP_XML_SELECTION],
  ];

  return (
    <Container size="md">
      <Form style={{ maxWidth: '60rem' }}>
        <h3 className="mb-4">
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConnectStep.connect.IDP.title"
            defaultMessage="Let's get started"
            description="Title for the SSO Identity Provider connection step."
          />
        </h3>
        <p className="mb-n3">
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConnectStep.connect.IDP.formInput"
            defaultMessage="What is your organization's SSO Identity Provider?"
            description="Helper message displayed against the option to select an SSO Identity Provider."
          />
        </p>
        <Form.Group className="mb-5.5">
          <ValidatedFormRadio
            formId="identityProvider"
            label=""
            options={ssoIdpOptions}
          />
        </Form.Group>
        <h4 className="mb-4">
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConnectStep.connect.edX.title"
            defaultMessage="Connect edX to your Identity Provider"
            description="Title for the step to connect edX to an Identity Provider."
          />
        </h4>
        <p className="mb-n3">
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConnectStep.connect.edX.formInput"
            defaultMessage="Select a method to connect edX to your Identity Provider"
            description="Helper message displayed against the option to select a connection method."
          />
        </p>
        <Form.Group className="mb-5">
          <ValidatedFormRadio
            formId="idpConnectOption"
            label=""
            options={idpConnectOptions}
          />
        </Form.Group>

        {showUrlEntry && (
          <Form.Group className="mb-4 mt-4">
            <ValidatedFormControl
              formId="metadataUrl"
              type="text"
              floatingLabel={intl.formatMessage({
                id: 'adminPortal.settings.ssoConfigConnectStep.metadataUrl.placeholder',
                defaultMessage: 'Identity Provider Metadata URL',
                description: 'Placeholder for the Identity Provider Metadata URL input field.',
              })}
              fieldInstructions={intl.formatMessage({
                id: 'adminPortal.settings.ssoConfigConnectStep.metadataUrl.instructions',
                defaultMessage: 'Find the URL in your Identity Provider portal or website.',
                description: 'Instructions for the Identity Provider Metadata URL input field.',
              })}
            />
          </Form.Group>
        )}

        {showXmlUpload
        && (
          <>
            <Dropzone
              onProcessUpload={onUploadXml}
              errorMessages={{
                invalidType: intl.formatMessage(messages.invalidType),
                invalidSize: intl.formatMessage(messages.invalidSize),
                multipleDragged: intl.formatMessage(messages.multipleDragged),
              }}
              maxSize={fiveGbInBytes}
              accept={{
                'text/xml': ['.xml'],
              }}
            />
            {xmlUploadFileName && (
            <Form.Control.Feedback type="valid">
              <FormattedMessage
                id="adminPortal.settings.ssoConfigConnectStep.xmlUploadSuccess"
                defaultMessage="Uploaded {xmlUploadFileName}"
                description="Success message displayed after uploading an Identity Provider Metadata XML file."
                values={{ xmlUploadFileName }}
              />
            </Form.Control.Feedback>
            )}
            {showErrors && xmlUploadError && <Form.Control.Feedback type="invalid">{xmlUploadError}</Form.Control.Feedback>}
          </>
        )}
      </Form>
    </Container>
  );
};

export default SSOConfigConnectStep;
