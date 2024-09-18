import React from 'react';
import {
  Alert, Button, Form, Container,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ValidatedFormControl from '../../../forms/ValidatedFormControl';
import { FormContext, FormFieldValidation, useFormContext } from '../../../forms/FormContext';
import { urlValidation } from '../../../../utils';
import { FormWorkflowStep } from '../../../forms/FormWorkflow';
import { FORM_ERROR_MESSAGE, setStepAction } from '../../../forms/data/actions';
import { INVALID_IDP_METADATA_ERROR, RECORD_UNDER_CONFIGURATIONS_ERROR } from '../../data/constants';
// TODO: Resolve dependency issue
// eslint-disable-next-line import/no-cycle
import { SSOConfigCamelCase } from '../SSOFormWorkflowConfig';

const messages = defineMessages({
  sapsfOauthRootUrl: {
    id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfOauthRootUrl',
    defaultMessage: 'Please enter an OAuth Root URL.',
    description: 'Helper message displayed against the option to enter an OAuth Root URL.',
  },
  odataApiRootUrl: {
    id: 'adminPortal.settings.ssoConfigConfigureStep.odataApiRootUrl',
    defaultMessage: 'Please enter an API Root URL.',
    description: 'Helper message displayed against the option to enter an API Root URL.',
  },
  sapsfPrivateKey: {
    id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfPrivateKey',
    defaultMessage: 'Please enter a Private Key.',
    description: 'Helper message displayed against the option to enter a Private Key.',
  },
  odataCompanyId: {
    id: 'adminPortal.settings.ssoConfigConfigureStep.odataCompanyId',
    defaultMessage: 'Please enter a Company ID.',
    description: 'Helper message displayed against the option to enter a Company ID.',
  },
  oauthUserId: {
    id: 'adminPortal.settings.ssoConfigConfigureStep.oauthUserId',
    defaultMessage: 'Please enter an OAuth User ID.',
    description: 'Helper message displayed against the option to enter an OAuth User ID.',
  },
});

const isSAPConfig = (fields) => fields.identityProvider === 'sap_success_factors';

export const getValidations = (intl) : FormFieldValidation[] => [
  {
    formFieldId: 'sapsfOauthRootUrl',
    validator: (fields) => isSAPConfig(fields) && (
      !fields.sapsfOauthRootUrl || !urlValidation(fields.sapsfOauthRootUrl)
    ) && intl.formatMessage(messages.sapsfOauthRootUrl),
  },
  {
    formFieldId: 'odataApiRootUrl',
    validator: (fields) => isSAPConfig(fields) && (
      !fields.odataApiRootUrl || !urlValidation(fields.odataApiRootUrl)
    ) && intl.formatMessage(messages.odataApiRootUrl),
  },
  {
    formFieldId: 'sapsfPrivateKey',
    validator: (fields) => (
      isSAPConfig(fields) && !fields.sapsfPrivateKey
    ) && intl.formatMessage(messages.sapsfPrivateKey),
  },
  {
    formFieldId: 'odataCompanyId',
    validator: (fields) => isSAPConfig(fields) && !fields.odataCompanyId && intl.formatMessage(messages.odataCompanyId),
  },
  {
    formFieldId: 'oauthUserId',
    validator: (fields) => isSAPConfig(fields) && !fields.oauthUserId && intl.formatMessage(messages.oauthUserId),
  },
];

const SSOConfigConfigureStep = () => {
  const {
    formFields,
    dispatch,
    allSteps,
    stateMap,
  }: FormContext = useFormContext();
  const intl = useIntl();
  const usingSAP = formFields?.identityProvider === 'sap_success_factors';

  const renderBaseFields = () => (
    <>
      <span className="d-flex pb-4">
        <h3>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConfigureStep.enterUserAttributes"
            defaultMessage="Enter user attributes"
            description="Helper message displayed against the option to enter user attributes."
          />
        </h3>
      </span>
      <p>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigConfigureStep.userAttributes.username.title"
          defaultMessage="Please enter the SAML user attributes from your Identity Provider. All attributes are space and case sensitive."
          description="Helper message displayed against the option to enter user attributes."
        />
      </p>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="usernameAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.username.label',
            defaultMessage: 'Username',
            description: 'Label for the username attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.username.instructions',
            defaultMessage: 'URN of the SAML attribute containing the username.',
            description: 'Instructions for the username attribute field.',

          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="userIdAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.userId.label',
            defaultMessage: 'User ID',
            description: 'Label for the user ID attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.userId.instructions',
            defaultMessage: 'URN of the SAML attribute that edX can use as a unique, persistent user ID.',
            description: 'Instructions for the user ID attribute field.',

          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="fullNameAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.fullName.label',
            defaultMessage: 'Full Name',
            description: 'Label for the full name attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.fullName.instructions',
            defaultMessage: 'URN of SAML attribute containing the user\'s full name.',
            description: 'Instructions for the full name attribute field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="firstNameAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.firstName.label',
            defaultMessage: 'First Name',
            description: 'Label for the first name attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.firstName.instructions',
            defaultMessage: 'URN of SAML attribute containing the user\'s first name.',
            description: 'Instructions for the first name attribute field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="lastNameAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.lastName.label',
            defaultMessage: 'Last Name',
            description: 'Label for the last name attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.lastName.instructions',
            defaultMessage: 'URN of SAML attribute containing the user\'s last name.',
            description: 'Instructions for the last name attribute field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="emailAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.email.label',
            defaultMessage: 'Email Address',
            description: 'Label for the email address attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.email.instructions',
            defaultMessage: 'URN of SAML attribute containing the user\'s email address[es].',
            description: 'Instructions for the email address attribute field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="countryAttribute"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.country.label',
            defaultMessage: 'Country',
            description: 'Label for the country attribute field.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.userAttributes.country.instructions',
            defaultMessage: 'URN of SAML attribute containing the user\'s country of residence.',
            description: 'Instructions for the country attribute field.',
          })}
        />
      </Form.Group>
    </>
  );
  const renderSAPFields = () => (
    <>
      <span className="d-flex pb-4">
        <h3>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConfigureStep.sapSuccessFactors.title"
            defaultMessage="Enable learner account auto-registration"
            description="Helper message displayed against the option to enable learner account auto-registration."
          />
        </h3>
      </span>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="sapsfOauthRootUrl"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfOauthRootUrl.label',
            defaultMessage: 'OAuth Root URL',
            description: 'Helper message displayed against the option to enter an OAuth Root URL.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfOauthRootUrl.instructions',
            defaultMessage: 'The URL hostname is what you see upon login to SuccessFactors BizX system, typically aligned with the IDP Entity ID.',
            description: 'Instructions for the OAuth Root URL input field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="odataApiRootUrl"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.odataApiRootUrl.label',
            defaultMessage: 'API Root URL',
            description: 'Helper message displayed against the option to enter an API Root URL.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.odataApiRootUrl.instructions',
            defaultMessage: 'The BizX OData API service hostname, typically aligned with the IDP entity ID.',
            description: 'Instructions for the API Root URL input field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="odataCompanyId"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.odataCompanyId.label',
            defaultMessage: 'Company ID',
            description: 'Helper message displayed against the option to enter a Company ID.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.odataCompanyId.instructions',
            defaultMessage: 'The BizX company profile identifier for your tenant.',
            description: 'Instructions for the Company ID input field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="sapsfPrivateKey"
          type="text"
          as="textarea"
          rows={4}
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfPrivateKey.label',
            defaultMessage: 'Private Key',
            description: 'Helper message displayed against the option to enter a Private Key.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.sapsfPrivateKey.instructions',
            defaultMessage: 'The Private Key value found in the PEM file generated from the OAuth2 Client Application Profile.',
            description: 'Instructions for the Private Key input field.',
          })}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId="oauthUserId"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.oauthUserId.label',
            defaultMessage: 'OAuth User ID',
            description: 'Helper message displayed against the option to enter an OAuth User ID.',
          })}
          fieldInstructions={intl.formatMessage({
            id: 'adminPortal.settings.ssoConfigConfigureStep.oauthUserId.instructions',
            defaultMessage: 'Username of the BizX administrator account that is configured for edX by the customer.',
            description: 'Instructions for the OAuth User ID input field.',
          })}
        />
      </Form.Group>
    </>
  );

  const returnToConnectStep = () => {
    const connectStep = allSteps?.[0] as FormWorkflowStep<SSOConfigCamelCase>;
    dispatch?.(
      setStepAction({ step: connectStep }),
    );
  };

  return (
    <Container size="md">

      <Form style={{ maxWidth: '60rem' }}>
        <h2>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConfigureStep.title"
            defaultMessage="Enter integration details"
            description="Title for the SSO integration details step."
          />
        </h2>
        {stateMap?.[FORM_ERROR_MESSAGE] === RECORD_UNDER_CONFIGURATIONS_ERROR && (
          <Alert
            variant="danger"
            actions={[
              <Button
                className="ml-3"
                onClick={returnToConnectStep}
              >
                <FormattedMessage
                  id="adminPortal.settings.ssoConfigConfigureStep.recordUnderConfiguration"
                  defaultMessage="Record under configuration"
                  description="Button text shown when the record is under configuration."
                />
              </Button>,
            ]}
            className="mt-3 mb-3"
            dismissible
            stacked
            icon={Info}
          >
            <Alert.Heading className="mt-1">
              <FormattedMessage
                id="adminPortal.settings.ssoConfigConfigureStep.configurationError.title"
                defaultMessage="Configuration Error"
                description="Title of the error message shown when the record is under configuration."
              />
            </Alert.Heading>
            <p className="mt-1">
              <FormattedMessage
                id="adminPortal.settings.ssoConfigConfigureStep.configurationError.message"
                defaultMessage="Your record was recently submitted for configuration and must completed before you can resubmit. Please check back in a few minutes. If the problem persists, contact enterprise customer support."
                description="Error message shown when the record is under configuration."
              />
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
                <FormattedMessage
                  id="adminPortal.settings.ssoConfigConfigureStep.returnToConnectStep"
                  defaultMessage="Return to Connect step"
                  description="Button text shown when the metadata is invalid and the user should return to the Connect step."
                />
              </Button>,
            ]}
            className="mt-3 mb-3"
            dismissible
            stacked
            icon={Info}
          >
            <Alert.Heading className="mt-1">
              <FormattedMessage
                id="adminPortal.settings.ssoConfigConfigureStep.metadataError.title"
                defaultMessage="Metadata Error"
                description="Title of the error message shown when the metadata is invalid."
              />
            </Alert.Heading>
            <p className="mt-1">
              <FormattedMessage
                id="adminPortal.settings.ssoConfigConfigureStep.metadataError.message"
                defaultMessage="Please return to the “Connect” step and verify that your metadata URL or metadata file is correct. After verifying, please try again. If the problem persists, contact enterprise customer support."
                description="Error message shown when the metadata is invalid."
              />
            </p>
          </Alert>
        )}
        <span className="d-flex pb-4">
          <h3>
            <FormattedMessage
              id="adminPortal.settings.ssoConfigConfigureStep.setDisplayName"
              defaultMessage="Set display name"
              description="Helper message displayed against the option to set a display name."
            />
          </h3>
        </span>
        <Form.Group className="mb-4">
          <ValidatedFormControl
            formId="displayName"
            type="text"
            floatingLabel={intl.formatMessage({
              id: 'adminPortal.settings.ssoConfigConfigureStep.displayName.placeholder',
              defaultMessage: 'Display Name (Optional)',
              description: 'Placeholder for the display name field.',
            })}
            fieldInstructions={intl.formatMessage({
              id: 'adminPortal.settings.ssoConfigConfigureStep.displayName.instructions',
              defaultMessage: 'Create a custom display name for this SSO integration.',
              description: 'Instructions for the display name field.',
            })}
          />
        </Form.Group>

        {usingSAP ? renderSAPFields() : renderBaseFields()}
      </Form>
    </Container>
  );
};

export default SSOConfigConfigureStep;
