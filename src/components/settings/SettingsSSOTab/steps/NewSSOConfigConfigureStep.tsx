import React from 'react';
import {
  Form, Container,
} from '@edx/paragon';

import ValidatedFormControl from '../../../forms/ValidatedFormControl';

const SSOConfigConfigureStep = () => {
  const renderBaseFields = () => (
    <>
      <h3>Enter user attributes</h3>
      <p>
        Please enter the SAML user attributes from your Identity Provider.
        All attributes are space and case sensitive.
      </p>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuthUserID"
          type="text"
          floatingLabel="User ID"
          fieldInstructions="URN of the SAML attribute that edX can use as a unique, persistent user ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuthFullName"
          type="text"
          floatingLabel="Full Name"
          fieldInstructions="URN of SAML attribute containing the user's full name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuthFirstName"
          type="text"
          floatingLabel="First Name"
          fieldInstructions="URN of SAML attribute containing the user's first name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuth "
          type="text"
          floatingLabel="Last Name"
          fieldInstructions="URN of SAML attribute containing the user's last name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuth "
          type="text"
          floatingLabel="Email Address"
          fieldInstructions="URN of SAML attribute containing the user's email address[es]."
        />
      </Form.Group>
    </>
  );
  const renderSAPFields = () => (
    <>
      <h3>Enable learner account auto-registration</h3>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuthRootURL"
          type="text"
          floatingLabel="OAuth Root URL"
          fieldInstructions="The URL hostname is what you see upon login to SuccessFactors BizX system, typically aligned with the IDP Entity ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyAPIRootURL"
          type="text"
          floatingLabel="API Root URL"
          fieldInstructions="The BizX OData API service hostname, typically aligned with the IDP entity ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyCompanyID"
          type="text"
          floatingLabel="Company ID"
          fieldInstructions="The BizX company profile identifier for your tenant."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyPrivateKey"
          type="text"
          as="textarea"
          rows={4}
          floatingLabel="Private Key"
          fieldInstructions="The Private Key value found in the PEM file generated from the OAuth2 Client Application Profile."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="DummyOAuthUserId"
          type="text"
          floatingLabel="OAuth User ID"
          fieldInstructions="Username of the BizX administrator account that is configured for edX by the customer."
        />
      </Form.Group>
    </>
  );

  return (

    <Container size="md">

      <Form style={{ maxWidth: '60rem' }}>
        <h2>Enter integration details</h2>
        <h3>Set display name</h3>
        <Form.Group className="mb-4">
          <ValidatedFormControl
            formId="DummyDisplayName"
            type="text"
            floatingLabel="Display Name (Optional)"
            fieldInstructions="Create a custom display name for this SSO integration"
          />
        </Form.Group>

        {/* TODO: Render SAP fields selectively once logic is in place */}
        {renderBaseFields()}
        {renderSAPFields()}
      </Form>
    </Container>
  );
};

export default SSOConfigConfigureStep;
