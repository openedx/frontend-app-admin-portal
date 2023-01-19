import React from "react";

import { Form } from "@edx/paragon";

// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
import { urlValidation } from "../../../../../utils";
import type { FormFieldValidation } from "../../../../forms/FormContext";

const formFieldNames = {
  DISPLAY_NAME: "displayName",
  CLIENT_ID: "clientId",
  CLIENT_SECRET: "clientSecret",
  ACCOUNT_ID: "canvasAccountId",
  CANVAS_BASE_URL: "canvasBaseUrl",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.CANVAS_BASE_URL,
    validator: (fields) => {
      const error = !urlValidation(fields[formFieldNames.CANVAS_BASE_URL]);
      return error && "Please enter a valid URL";
    },
  },
  {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (fields) => {
      // TODO: Check for duplicate display names
      const displayName = fields[formFieldNames.DISPLAY_NAME];
      const error = displayName?.length > 20;
      return error && "Display Name should be 20 characters or less";
    },
  },
];

// Page 2 of Canvas LMS config workflow
const CanvasConfigAuthorizePage = () => (
  <span>
    <h2>Authorize connection to Canvas</h2>

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
      <Form.Group>
        <ValidatedFormControl
          formId={formFieldNames.ACCOUNT_ID}
          className="my-4"
          type="number"
          maxLength={255}
          floatingLabel="Canvas Account Number"
        />
      </Form.Group>
      <Form.Group className="my-4">
        <ValidatedFormControl
          formId={formFieldNames.CANVAS_BASE_URL}
          className="my-4"
          type="text"
          maxLength={255}
          floatingLabel="Canvas Base URL"
        />
      </Form.Group>
      {/* TODO: Style panel */}
      <div>
        <h3>Action in Canvas required to complete authorization</h3>
        Advancing to the next step will open a new window to complete the
        authorization process in Canvas. Return to this window following
        authorization to finish configuring your new integration.
      </div>
    </Form>
  </span>
);

export default CanvasConfigAuthorizePage;
