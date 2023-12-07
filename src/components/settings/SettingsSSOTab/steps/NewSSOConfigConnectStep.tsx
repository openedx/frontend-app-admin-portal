import React, { useState } from 'react';
import { Container, Dropzone, Form, Stack } from '@edx/paragon';

import ValidatedFormRadio from '../../../forms/ValidatedFormRadio';
import ValidatedFormControl from '../../../forms/ValidatedFormControl';
import { FormContext, FormFieldValidation, useFormContext } from '../../../forms/FormContext';
import { setFormFieldAction } from '../../../forms/data/actions';
import { urlValidation } from '../../../../utils';

export const IDP_URL_SELECTION = 'idp_metadata_url';
export const IDP_XML_SELECTION = 'idp_metadata_xml';
const urlEntrySelected = (formFields) => formFields?.idpConnectOption === IDP_URL_SELECTION;
const xmlEntrySelected = (formFields) => formFields?.idpConnectOption === IDP_XML_SELECTION;

export const validations: FormFieldValidation[] = [
  {
    formFieldId: 'identityProvider',
    validator: (fields) => !fields.identityProvider && 'Please select an SSO Identity Provider',
  },
  {
    formFieldId: 'idpConnectOption',
    validator: (fields) => !fields.idpConnectOption && 'Please select a connection method',
  },
  {
    formFieldId: 'metadataUrl',
    validator: (fields) => {
      const error = urlEntrySelected(fields) && !urlValidation(fields.metadataUrl);
      return error && 'Please enter an Identity Provider Metadata URL';
    },
  },
  {
    formFieldId: 'metadataXml',
    validator: (fields) => {
      const error = !fields.metadataXml && xmlEntrySelected(fields);
      return error && 'Please upload an Identity Provider Metadata XML file';
    },
  },
];

const SSOConfigConnectStep = () => {
  const fiveGbInBytes = 5368709120;
  const ssoIdpOptions = [
    ['Microsoft Entra ID', 'microsoft_entra_id'],
    ['Google Workspace', 'google_workspace'],
    ['Okta', 'okta'],
    ['OneLogin', 'one_login'],
    ['SAP SuccessFactors', 'sap_success_factors'],
    ['Other', 'other'],
  ];
  const idpConnectOptions = [
    ['Enter identity Provider Metadata URL', IDP_URL_SELECTION],
    ['Upload Identity Provider Metadata XML file', IDP_XML_SELECTION],
  ];

  const {
    formFields, dispatch, showErrors, errorMap,
  }: FormContext = useFormContext();
  const [xmlUploadFileName, setXmlUploadFileName] = useState('');
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

  return (
    <Container size="md">

      <Form style={{ maxWidth: '60rem' }}>

        <h3 className="mb-4">Let&apos;s get started</h3>
        <p className="mb-n3">What is your organization&apos;s SSO Identity Provider?</p>
        <Form.Group className="mb-5.5">
          <ValidatedFormRadio
            formId="identityProvider"
            label=""
            options={ssoIdpOptions}
          />
        </Form.Group>

        <h4 className="mb-4">Connect edX to your Identity Provider</h4>
        <p className="mb-n3">Select a method to connect edX to your Identity Provider</p>
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
              floatingLabel="Identity Provider Metadata URL"
              fieldInstructions="Find the URL in your Identity Provider portal or website."
            />
          </Form.Group>
        )}

        {showXmlUpload
        && (
          <>
            <Dropzone
              onProcessUpload={onUploadXml}
              errorMessages={{
                invalidType: 'Invalid file type, only xml images allowed.',
                invalidSize: 'The file size must be under 5 gb.',
                multipleDragged: 'Cannot upload more than one file.',
              }}
              maxSize={fiveGbInBytes}
              accept={{
                'text/xml': ['.xml'],
              }}
            />
            {xmlUploadFileName && (
            <Form.Control.Feedback type="valid">
              Uploaded{' '}
              {xmlUploadFileName}
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
