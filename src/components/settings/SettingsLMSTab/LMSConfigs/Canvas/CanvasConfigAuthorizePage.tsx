import React from 'react';

import {
  Alert, Container, Form, Image,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import { CANVAS_TYPE, INVALID_LINK, INVALID_NAME } from '../../../data/constants';
import ValidatedFormControl from '../../../../forms/ValidatedFormControl';
import { channelMapping, isValidNumber, urlValidation } from '../../../../../utils';
import type { FormFieldValidation } from '../../../../forms/FormContext';
import { useFormContext } from '../../../../forms/FormContext';
import FormWaitModal from '../../../../forms/FormWaitModal';
import { WAITING_FOR_ASYNC_OPERATION } from '../../../../forms/FormWorkflow';
import { setWorkflowStateAction } from '../../../../forms/data/actions';
import { LMS_AUTHORIZATION_FAILED } from '../utils';

export const formFieldNames = {
  DISPLAY_NAME: 'displayName',
  CLIENT_ID: 'clientId',
  CLIENT_SECRET: 'clientSecret',
  ACCOUNT_ID: 'canvasAccountId',
  CANVAS_BASE_URL: 'canvasBaseUrl',
};

export const validationMessages = {
  displayNameRequired: 'Please enter Display Name',
  clientIdRequired: 'Please enter API Client ID',
  clientSecretRequired: 'Please enter API Client Secret',
  accountIdRequired: 'Please enter Account ID',
  canvasUrlRequired: 'Please enter Canvas Base Url',
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.CANVAS_BASE_URL,
    validator: (fields) => {
      const canvasUrl = fields[formFieldNames.CANVAS_BASE_URL];
      if (canvasUrl) {
        const error = !urlValidation(canvasUrl);
        return error ? INVALID_LINK : false;
      }
      return validationMessages.canvasUrlRequired;
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      const error = !(fields[formFieldNames.DISPLAY_NAME]);
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
  {
    formFieldId: formFieldNames.ACCOUNT_ID,
    validator: (fields) => {
      const error = !isValidNumber(fields[formFieldNames.ACCOUNT_ID]);
      return error && validationMessages.accountIdRequired;
    },
  },
  {
    formFieldId: formFieldNames.CLIENT_ID,
    validator: (fields) => {
      const error = !(fields[formFieldNames.CLIENT_ID]);
      return error && validationMessages.clientIdRequired;
    },
  },
  {
    formFieldId: formFieldNames.CLIENT_SECRET,
    validator: (fields) => {
      const error = !(fields[formFieldNames.CLIENT_SECRET]);
      return error && validationMessages.clientSecretRequired;
    },
  },
];

// Settings page of Canvas LMS config workflow
const CanvasConfigAuthorizePage = () => {
  const { formFields, dispatch, stateMap } = useFormContext();
  return (
    <Container size="md">
      <span className="d-flex pb-4">
        <Image
          className="lms-icon mr-2"
          src={channelMapping[CANVAS_TYPE].icon}
        />
        <h3>
          Authorize connection to Canvas
        </h3>
      </span>
      <Form style={{ maxWidth: '60rem' }}>
        {stateMap?.[LMS_AUTHORIZATION_FAILED] && (
          <Alert variant="danger" className="mb-4" icon={Info}>
            <h3>Enablement failed</h3>
            We were unable to enable your Canvas integration. Please try again
            or contact enterprise customer support.
          </Alert>
        )}
        {formFields?.refreshToken && (
          <Alert variant="info" className="mb-4" icon={Info}>
            <h3>Form updates require reauthorization</h3>
            Your authorization is currently complete. By updating the form below,
            reauthorization will be required and advancing to the next step will
            open a new window to complete the process in Canvas. Return to this window
            following reauthorization to finish reconfiguring your integration.
          </Alert>
        )}
        <Form.Group className="mb-4">
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel="Display Name"
            fieldInstructions="Create a custom name for this LMS"
          />
        </Form.Group>
        <Form.Group className="mb-4.5">
          <ValidatedFormControl
            formId={formFieldNames.CLIENT_ID}
            type="text"
            maxLength={255}
            floatingLabel="API Client ID"
          />
        </Form.Group>
        <Form.Group className="mb-4.5">
          <ValidatedFormControl
            formId={formFieldNames.CLIENT_SECRET}
            type="password"
            maxLength={255}
            floatingLabel="API Client Secret"
          />
        </Form.Group>
        <Form.Group className="mb-4.5">
          <ValidatedFormControl
            formId={formFieldNames.ACCOUNT_ID}
            type="number"
            maxLength={255}
            floatingLabel="Canvas Account Number"
          />
        </Form.Group>
        <Form.Group className="mb-4.5">
          <ValidatedFormControl
            formId={formFieldNames.CANVAS_BASE_URL}
            type="text"
            maxLength={255}
            floatingLabel="Canvas Base URL"
          />
        </Form.Group>
        <Alert variant="info" icon={Info}>
          <h3>Authorization in Canvas required to complete configuration</h3>
          Advancing to the next step will open a new window to complete the authorization
          process in Canvas. Return to this window following authorization to finish configuring
          your new integration.
        </Alert>
        <FormWaitModal
          triggerState={WAITING_FOR_ASYNC_OPERATION}
          onClose={() => dispatch?.(
            setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false),
          )}
          header="Authorization in progress"
          text="Please confirm authorization through Canvas and return to this window once complete."
        />
      </Form>
    </Container>
  );
};

export default CanvasConfigAuthorizePage;
