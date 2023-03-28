import React from "react";

import { Form, Alert } from "@edx/paragon";
import { Info } from "@edx/paragon/icons";

// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
import { urlValidation } from "../../../../../utils";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";
import {
  useFormContext,
  // @ts-ignore
} from "../../../../forms/FormContext.tsx";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  CLIENT_ID: "clientId",
  CLIENT_SECRET: "clientSecret",
  DEGREED_BASE_URL: "degreedBaseUrl",
  DEGREED_FETCH_URL: "degreedFetchUrl",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.DEGREED_BASE_URL,
    validator: (fields) => {
      const degreedUrl = fields[formFieldNames.DEGREED_BASE_URL];
      if (degreedUrl) {
        const error = !urlValidation(degreedUrl);
        return error ? "Please enter a valid URL" : false;
      } else {
        return true;
      }
    },
  },
  {
    formFieldId: formFieldNames.DEGREED_FETCH_URL,
    validator: (fields) => {
      const degreedUrl = fields[formFieldNames.DEGREED_FETCH_URL];
      if (degreedUrl) {
        const error = !urlValidation(degreedUrl);
        return error ? "Please enter a valid URL" : false;
      } else {
        // fetch url is optional
        return false;
      }
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      const displayName = fields[formFieldNames.DISPLAY_NAME];
      return !displayName;
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      const displayName = fields[formFieldNames.DISPLAY_NAME];
      const error = displayName?.length > 20;
      return error && "Display name should be 20 characters or less";
    },
  },
  {
    formFieldId: formFieldNames.CLIENT_ID,
    validator: (fields) => {
      const clientId = fields[formFieldNames.CLIENT_ID];
      return !clientId;
    },
  },
  {
    formFieldId: formFieldNames.CLIENT_SECRET,
    validator: (fields) => {
      const clientSecret = fields[formFieldNames.CLIENT_SECRET];
      return !clientSecret;
    },
  },
];

// Settings page of Degreed LMS config workflow
const DegreedConfigEnablePage = () => {
  const { dispatch, stateMap } = useFormContext();
  return (
    <span>
      <h2>Enable connection to Degreed</h2>
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
            formId={formFieldNames.CLIENT_ID}
            className="mb-4"
            type="text"
            maxLength={255}
            floatingLabel="API Client ID"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.CLIENT_SECRET}
            className="my-4"
            type="password"
            maxLength={255}
            floatingLabel="API Client Secret"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.DEGREED_BASE_URL}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="Degreed Base URL"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.DEGREED_FETCH_URL}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="Degreed Token Fetch Base URL"
            fieldInstructions="Optional: If provided, will be used as the url to fetch tokens."
          />
        </Form.Group>
      </Form>
    </span>
  );
};

export default DegreedConfigEnablePage;
