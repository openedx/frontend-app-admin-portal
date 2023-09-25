import React from 'react';
import { Container, Dropzone, Form } from '@edx/paragon';

import ValidatedFormRadio from '../../../forms/ValidatedFormRadio';
import ValidatedFormControl from '../../../forms/ValidatedFormControl';
import { FormContext, useFormContext } from '../../../forms/FormContext';

const SSOConfigConnectStep = () => {
  const fiveGbInBytes = 5368709120;
  const ssoIdpOptions = [
    ['Microsoft Azure Active Directory (Azure AD)', 'azure_ad'],
    ['Google Workspace', 'google_workspace'],
    ['Okta', 'okta'],
    ['OneLogin', 'one_login'],
    ['SAP SuccessFactors', 'sap_success_factors'],
    ['Other', 'other'],
  ];
  const idpConnectOptions = [
    ['Enter identity Provider Metadata URL', 'idp_metadata_url'],
    ['Upload Identity Provider Metadata XML file', 'idp_metadata_xml'],
  ];

  const {
    formFields,
  }: FormContext = useFormContext();
  const showUrlEntry = formFields?.idpConnectOption === 'idp_metadata_url';
  const showXmlUpload = formFields?.idpConnectOption === 'idp_metadata_xml';

  // TODO: Store uploaded XML data
  const onUploadXml = () => null;

  return (
    <Container size="md">

      <Form style={{ maxWidth: '60rem' }}>

        <h1>Let&apos;s get started</h1>
        What is your organization&apos;s SSO Identity Provider?
        <Form.Group className="mb-4.5">
          <ValidatedFormRadio
            formId="DummyIDP"
            label=""
            options={ssoIdpOptions}
          />
        </Form.Group>

        <h2>Connect edX to your Identity Provider</h2>
        Select a method to connect edX to your Identity Provider
        <Form.Group className="mb-4.5">
          <ValidatedFormRadio
            formId="idpConnectOption"
            label=""
            options={idpConnectOptions}
          />
        </Form.Group>

        {showUrlEntry && (
        <Form.Group className="mb-4">
          <ValidatedFormControl
            formId="DummyIDPUrl"
            type="text"
            floatingLabel="Identity Provider Metadata URL"
            fieldInstructions="Find the URL in your Identity Provider portal or website."
          />
        </Form.Group>
        )}

        {showXmlUpload
        && (
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
        )}
      </Form>
    </Container>
  );
};

export default SSOConfigConnectStep;
