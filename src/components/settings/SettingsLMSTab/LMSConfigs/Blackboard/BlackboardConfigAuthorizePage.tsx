import React from 'react';
import {
  Alert, Container, Form, Image,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ValidatedFormControl from '../../../../forms/ValidatedFormControl';
import { BLACKBOARD_TYPE, INVALID_LINK, INVALID_NAME } from '../../../data/constants';
import { channelMapping, urlValidation } from '../../../../../utils';
import type { FormFieldValidation } from '../../../../forms/FormContext';
import { useFormContext } from '../../../../forms/FormContext';
import FormWaitModal from '../../../../forms/FormWaitModal';
import { WAITING_FOR_ASYNC_OPERATION } from '../../../../forms/FormWorkflow';
import { setWorkflowStateAction } from '../../../../forms/data/actions';
import { LMS_AUTHORIZATION_FAILED } from '../utils';

export const formFieldNames = {
  DISPLAY_NAME: 'displayName',
  BLACKBOARD_BASE_URL: 'blackboardBaseUrl',
};

export const validationMessages = {
  displayNameRequired: 'Please enter Display Name',
  baseUrlRequired: 'Please enter Blackboard Base URL',
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.BLACKBOARD_BASE_URL,
    validator: (fields) => {
      const error = !fields[formFieldNames.BLACKBOARD_BASE_URL];
      return error && validationMessages.baseUrlRequired;
    },
  },
  {
    formFieldId: formFieldNames.BLACKBOARD_BASE_URL,
    validator: (fields) => {
      const error = !urlValidation(fields[formFieldNames.BLACKBOARD_BASE_URL]);
      return error && INVALID_LINK;
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      const error = !fields[formFieldNames.DISPLAY_NAME];
      return error && validationMessages.displayNameRequired;
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      const displayName = fields[formFieldNames.DISPLAY_NAME];
      const error = displayName?.length > 20;
      return error && INVALID_NAME;
    },
  },
];

// Settings page of Blackboard LMS config workflow
const BlackboardConfigAuthorizePage = () => {
  const { formFields, dispatch, stateMap } = useFormContext();
  const intl = useIntl();

  return (
    <Container size="md">
      <span className="d-flex pb-4">
        <Image
          className="lms-icon mr-2"
          src={channelMapping[BLACKBOARD_TYPE].icon}
        />
        <h3>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.blackboard.authorizeConnection"
            defaultMessage="Authorize connection to Blackboard"
            description="Title for the Blackboard LMS authorization page."
          />
        </h3>
      </span>
      <Form style={{ maxWidth: '60rem' }}>
        {stateMap?.[LMS_AUTHORIZATION_FAILED] && (
          <Alert variant="danger" className="mb-4" icon={Info}>
            <h3>
              <FormattedMessage
                id="adminPortal.settings.learningPlatformTab.blackboard.enablementFailed"
                defaultMessage="Enablement failed"
                description="Error message when Blackboard integration enablement fails."
              />
            </h3>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.blackboard.enablementFailedMessage"
              defaultMessage="We were unable to enable your Blackboard integration. Please try again or contact enterprise customer support."
              description="Error message details for Blackboard integration enablement failure."
            />
          </Alert>
        )}
        {formFields?.refreshToken && (
          <Alert variant="info" className="mb-4" icon={Info}>
            <h3>
              <FormattedMessage
                id="adminPortal.settings.learningPlatformTab.blackboard.formReauthorization"
                defaultMessage="Form updates require reauthorization"
                description="Message indicating that form updates require reauthorization for Blackboard integration."
              />
            </h3>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.blackboard.formReauthorizationMessage"
              defaultMessage="Your authorization is currently complete. By updating the form below, reauthorization will be required and advancing to the next step will open a new window to complete the process in Blackboard. Return to this window following reauthorization to finish reconfiguring your integration."
              description="Details about form updates requiring reauthorization for Blackboard integration."
            />
          </Alert>
        )}
        <Form.Group className="my-4.5">
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel={intl.formatMessage({
              id: 'adminPortal.settings.learningPlatformTab.blackboard.displayName',
              defaultMessage: 'Display Name',
              description: 'Label for the Display Name field in the Blackboard LMS configuration.',
            })}
            fieldInstructions={intl.formatMessage({
              id: 'adminPortal.settings.learningPlatformTab.blackboard.createCustomName',
              defaultMessage: 'Create a custom name for this LMS',
              description: 'Instructions for creating a custom name for Blackboard LMS.',
            })}
          />
        </Form.Group>
        <Form.Group className="my-4.5">
          <ValidatedFormControl
            formId={formFieldNames.BLACKBOARD_BASE_URL}
            type="text"
            maxLength={255}
            floatingLabel={intl.formatMessage({
              id: 'adminPortal.settings.learningPlatformTab.blackboard.baseURL',
              defaultMessage: 'Blackboard Base URL',
              description: 'Label for the Base URL field in the Blackboard LMS configuration.',
            })}
          />
        </Form.Group>
        <Alert variant="info" icon={Info}>
          <h3>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.blackboard.authorizationRequired"
              defaultMessage="Authorization in Blackboard required to complete configuration"
              description="Message indicating that Blackboard authorization is required to complete the configuration."
            />
          </h3>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.blackboard.authorizationRequiredMessage"
            defaultMessage="Advancing to the next step will open a new window to complete the authorization process in Blackboard. Return to this window following authorization to finish configuring your new integration."
            description="Details about Blackboard authorization requirement for completing the configuration."
          />
        </Alert>
        <FormWaitModal
          triggerState={WAITING_FOR_ASYNC_OPERATION}
          onClose={() => dispatch?.(
            setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false),
          )}
          header={intl.formatMessage({
            id: 'adminPortal.settings.learningPlatformTab.blackboard.authorizationInProgress.header',
            defaultMessage: 'Authorization in progress',
            description: 'Header for the authorization in progress modal.',
          })}
          text={intl.formatMessage({
            id: 'adminPortal.settings.learningPlatformTab.blackboard.authorizationInProgress.message',
            defaultMessage: 'Please confirm authorization through Blackboard and return to this window once complete.',
            description: 'Text for the authorization in progress modal.',
          })}
        />
      </Form>
    </Container>
  );
};

export default BlackboardConfigAuthorizePage;
