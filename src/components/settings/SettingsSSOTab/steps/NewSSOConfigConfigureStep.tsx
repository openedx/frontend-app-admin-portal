import React from 'react';
import {
  Alert, Button, Form, Container,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import ValidatedFormControl from '../../../forms/ValidatedFormControl';
import { FormContext, FormFieldValidation, useFormContext } from '../../../forms/FormContext';
import { urlValidation } from '../../../../utils';
import { FormWorkflowStep } from '../../../forms/FormWorkflow';
import { FORM_ERROR_MESSAGE, setStepAction } from '../../../forms/data/actions';
import { INVALID_IDP_METADATA_ERROR, RECORD_UNDER_CONFIGURATIONS_ERROR } from '../../data/constants';
import { SSOConfigCamelCase } from '../SSOFormWorkflowConfig';

const isSAPConfig = (fields) => fields.identityProvider === 'sap_success_factors';

export const validations: FormFieldValidation[] = [
  {
    formFieldId: 'sapsfOauthRootUrl',
    validator: (fields) => isSAPConfig(fields) && (!fields.sapsfOauthRootUrl || !urlValidation(fields.sapsfOauthRootUrl)) && 'Please enter an OAuth Root URL.',
  },
  {
    formFieldId: 'odataApiRootUrl',
    validator: (fields) => isSAPConfig(fields) && (!fields.odataApiRootUrl || !urlValidation(fields.odataApiRootUrl)) && 'Please enter an API Root URL.',
  },
  {
    formFieldId: 'sapsfPrivateKey',
    validator: (fields) => isSAPConfig(fields) && !fields.sapsfPrivateKey && 'Please enter a Private Key.',
  },
  {
    formFieldId: 'odataCompanyId',
    validator: (fields) => isSAPConfig(fields) && !fields.odataCompanyId && 'Please enter a Company ID.',
  },
  {
    formFieldId: 'oauthUserId',
    validator: (fields) => isSAPConfig(fields) && !fields.oauthUserId && 'Please enter an OAuth User ID.',
  },
];

const SSOConfigConfigureStep = () => {
  const {
    formFields,
    dispatch,
    allSteps,
    stateMap,
  }: FormContext = useFormContext();
  const usingSAP = formFields?.identityProvider === 'sap_success_factors';

  const renderBaseFields = () => (
    <>
      <span className="d-flex pb-4">
        <h3>Enter user attributes</h3>
      </span>
      <p>
        Please enter the SAML user attributes from your Identity Provider.
        All attributes are space and case sensitive.
      </p>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="usernameAttribute"
          type="text"
          floatingLabel="Username"
          fieldInstructions="URN of the SAML attribute containing the username."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="userIdAttribute"
          type="text"
          floatingLabel="User ID"
          fieldInstructions="URN of the SAML attribute that edX can use as a unique, persistent user ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="fullNameAttribute"
          type="text"
          floatingLabel="Full Name"
          fieldInstructions="URN of SAML attribute containing the user's full name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="firstNameAttribute"
          type="text"
          floatingLabel="First Name"
          fieldInstructions="URN of SAML attribute containing the user's first name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="lastNameAttribute"
          type="text"
          floatingLabel="Last Name"
          fieldInstructions="URN of SAML attribute containing the user's last name."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="emailAttribute"
          type="text"
          floatingLabel="Email Address"
          fieldInstructions="URN of SAML attribute containing the user's email address[es]."
        />
      </Form.Group>
    </>
  );
  const renderSAPFields = () => (
    <>
      <span className="d-flex pb-4">
        <h3>Enable learner account auto-registration</h3>
      </span>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="sapsfOauthRootUrl"
          type="text"
          floatingLabel="OAuth Root URL"
          fieldInstructions="The URL hostname is what you see upon login to SuccessFactors BizX system, typically aligned with the IDP Entity ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="odataApiRootUrl"
          type="text"
          floatingLabel="API Root URL"
          fieldInstructions="The BizX OData API service hostname, typically aligned with the IDP entity ID."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="odataCompanyId"
          type="text"
          floatingLabel="Company ID"
          fieldInstructions="The BizX company profile identifier for your tenant."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="sapsfPrivateKey"
          type="text"
          as="textarea"
          rows={4}
          floatingLabel="Private Key"
          fieldInstructions="The Private Key value found in the PEM file generated from the OAuth2 Client Application Profile."
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="oauthUserId"
          type="text"
          floatingLabel="OAuth User ID"
          fieldInstructions="Username of the BizX administrator account that is configured for edX by the customer."
        />
      </Form.Group>
    </>
  );

  const returnToConnectStep = () => {
    const connectStep = allSteps?.[0] as FormWorkflowStep<SSOConfigCamelCase>;
    dispatch?.(
      setStepAction({ step: connectStep })
    );
  };

  return (

    <Container size="md">

      <Form style={{ maxWidth: '60rem' }}>
        <h2>Enter integration details</h2>
        {stateMap?.[FORM_ERROR_MESSAGE] === RECORD_UNDER_CONFIGURATIONS_ERROR && (
          <Alert
            variant="danger"
            actions={[
              <Button
                className="ml-3"
                onClick={returnToConnectStep}
              >
                Record under configuration
              </Button>,
            ]}
            className="mt-3 mb-3"
            dismissible
            stacked
            icon={Info}
          >
            <Alert.Heading className="mt-1">Configuration Error</Alert.Heading>
            <p className="mt-1">
              Your record was recently submitted for configuration and must completed before you can resubmit. Please
              check back in a few minutes. If the problem persists, contact enterprise customer support.
            </p>
          </Alert>
        )}
        {stateMap?.[FORM_ERROR_MESSAGE] === INVALID_IDP_METADATA_ERROR && (
          <Alert
            variant="danger"
            actions={[
              <Button
                className="ml-3"
                onClick={returnToConnectStep}
              >
                Return to Connect step
              </Button>,
            ]}
            className="mt-3 mb-3"
            dismissible
            stacked
            icon={Info}
          >
            <Alert.Heading className="mt-1">Metadata Error</Alert.Heading>
            <p className="mt-1">
              Please return to the “Connect” step and verify that your metadata URL or metadata file is correct. After
              verifying, please try again. If the problem persists, contact enterprise customer support.
            </p>
          </Alert>
        )}
        <span className="d-flex pb-4">
          <h3>Set display name</h3>
        </span>
        <Form.Group className="mb-4">
          <ValidatedFormControl
            formId="displayName"
            type="text"
            floatingLabel="Display Name (Optional)"
            fieldInstructions="Create a custom display name for this SSO integration."
          />
        </Form.Group>

        {usingSAP ? renderSAPFields() : renderBaseFields()}
      </Form>
    </Container>
  );
};

export default SSOConfigConfigureStep;
