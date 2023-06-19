import React from 'react';

import { Container, Form, Image } from '@edx/paragon';

import { DEGREED2_TYPE, INVALID_LINK, INVALID_NAME } from '../../../data/constants';
import ValidatedFormControl from '../../../../forms/ValidatedFormControl';
import { channelMapping, urlValidation } from '../../../../../utils';
import type { FormFieldValidation } from '../../../../forms/FormContext';

export const formFieldNames = {
  DISPLAY_NAME: 'displayName',
  CLIENT_ID: 'clientId',
  CLIENT_SECRET: 'clientSecret',
  DEGREED_BASE_URL: 'degreedBaseUrl',
  DEGREED_TOKEN_FETCH_BASE_URL: 'degreedTokenFetchBaseUrl',
};

export const validationMessages = {
  displayNameRequired: 'Please enter Display Name',
  clientIdRequired: 'Please enter Client Id',
  clientSecretRequired: 'Please enter Client Secret',
  degreedUrlRequired: 'Please enter Degreed Base Url',
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.DEGREED_BASE_URL,
    validator: (fields) => {
      const degreedUrl = fields[formFieldNames.DEGREED_BASE_URL];
      if (degreedUrl) {
        const error = !urlValidation(degreedUrl);
        return error ? INVALID_LINK : false;
      }
      return validationMessages.degreedUrlRequired;
    },
  },
  {
    formFieldId: formFieldNames.DEGREED_TOKEN_FETCH_BASE_URL,
    validator: (fields) => {
      const degreedUrl = fields[formFieldNames.DEGREED_TOKEN_FETCH_BASE_URL];
      if (degreedUrl) {
        const error = !urlValidation(degreedUrl);
        return error ? INVALID_LINK : false;
      }
      // fetch url is optional
      return false;
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
    formFieldId: formFieldNames.CLIENT_ID,
    validator: (fields) => {
      const error = !fields[formFieldNames.CLIENT_ID];
      return error && validationMessages.clientIdRequired;
    },
  },
  {
    formFieldId: formFieldNames.CLIENT_SECRET,
    validator: (fields) => {
      const error = !fields[formFieldNames.CLIENT_SECRET];
      return error && validationMessages.clientSecretRequired;
    },
  },
];

// Settings page of Degreed LMS config workflow
const DegreedConfigEnablePage = () => (
  <Container size="md">
    <span className="d-flex pb-4">
      <Image
        className="lms-icon mr-2"
        src={channelMapping[DEGREED2_TYPE].icon}
      />
      <h3>
        Enable connection to Degreed
      </h3>
    </span>
    <Form style={{ maxWidth: '60rem' }}>
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
          formId={formFieldNames.DEGREED_BASE_URL}
          type="text"
          maxLength={255}
          floatingLabel="Degreed Base URL"
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <ValidatedFormControl
          formId={formFieldNames.DEGREED_TOKEN_FETCH_BASE_URL}
          type="text"
          maxLength={255}
          floatingLabel="Degreed Token Fetch Base URL"
          fieldInstructions="Optional: If provided, will be used as the url to fetch tokens"
        />
      </Form.Group>
    </Form>
  </Container>
);

export default DegreedConfigEnablePage;
