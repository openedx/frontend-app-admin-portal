import React from "react";

import { Container, Form, Image } from "@edx/paragon";

// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
import { channelMapping, urlValidation } from "../../../../../utils";
import { INVALID_LINK, INVALID_NAME, MOODLE_TYPE } from "../../../data/constants";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  MOODLE_BASE_URL: "moodleBaseUrl",
  SERVICE_SHORT_NAME: "serviceShortName",
  TOKEN: "token",
  USERNAME: "username",
  PASSWORD: "password",
};

export const validationMessages = {
  displayNameRequired: 'Please enter Display Name',
  baseUrlRequired: 'Please enter Moodle Base Url',
  serviceNameRequired: 'Please enter Webservice Short Name',
  verificationRequired: 'Please provide either a token OR a username and password',
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.MOODLE_BASE_URL,
    validator: (fields) => {
      const moodleUrl = fields[formFieldNames.MOODLE_BASE_URL];
      if (moodleUrl) {
        const error = !urlValidation(moodleUrl);
        return error ? INVALID_LINK : false;
      } else {
        return true;
      }
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
    formFieldId: formFieldNames.MOODLE_BASE_URL,
    validator: (fields) => {
      const error = !fields[formFieldNames.MOODLE_BASE_URL];
      return error && validationMessages.baseUrlRequired;
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
    formFieldId: formFieldNames.SERVICE_SHORT_NAME,
    validator: (fields) => {
      const error = !fields[formFieldNames.SERVICE_SHORT_NAME];
      return error && validationMessages.serviceNameRequired;
    },
  },
  {
    formFieldId: formFieldNames.PASSWORD,
    validator: (fields) => {
      const token = fields[formFieldNames.TOKEN];
      const username = fields[formFieldNames.USERNAME];
      const password = fields[formFieldNames.PASSWORD];
      if (!token) {
        if (username && password) {
          return false;
        }
      } else {
        if (!username && !password) {
          return false;
        }
      }
      if (!token && !username && !password) {
        return true;
      }
      return validationMessages.verificationRequired;
    },
  },
];

// Settings page of Moodle LMS config workflow
const MoodleConfigEnablePage = () => {
  return (
    <Container size='md'>
      <span className='d-flex pb-4'>
        <Image
          className="lms-icon mr-2"
          src={channelMapping[MOODLE_TYPE].icon}
        />
        <h3>
          Enable connection to Moodle
        </h3>
      </span>
      <Form style={{ maxWidth: "60rem" }}>
        <Form.Group className="my-2.5">
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel="Display Name"
            fieldInstructions="Create a custom name for this LMS."
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.MOODLE_BASE_URL}
            className="mb-4"
            type="text"
            maxLength={255}
            floatingLabel="Moodle Base URL"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SERVICE_SHORT_NAME}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="Webservice Short Name"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.TOKEN}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="Token"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.USERNAME}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="Username"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.PASSWORD}
            className="my-4"
            type="password"
            maxLength={255}
            floatingLabel="Password"
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default MoodleConfigEnablePage;
