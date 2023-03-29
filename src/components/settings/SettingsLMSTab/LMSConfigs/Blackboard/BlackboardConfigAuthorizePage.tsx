import React from "react";

import { Alert, Container, Form, Image } from "@edx/paragon";
import { Info } from "@edx/paragon/icons";

// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
import { BLACKBOARD_TYPE, INVALID_LINK, INVALID_NAME } from "../../../data/constants";
import { channelMapping, urlValidation } from "../../../../../utils";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";
import {
  useFormContext,
  // @ts-ignore
} from "../../../../forms/FormContext.tsx";
// @ts-ignore
import FormWaitModal from "../../../../forms/FormWaitModal.tsx";
// @ts-ignore
import { WAITING_FOR_ASYNC_OPERATION } from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import { setWorkflowStateAction } from "../../../../forms/data/actions.ts";
// @ts-ignore
import { LMS_AUTHORIZATION_FAILED } from "./BlackboardConfig.tsx";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  BLACKBOARD_BASE_URL: "blackboardBaseUrl",
};

export const validations: FormFieldValidation[] = [
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
      const displayName = fields[formFieldNames.DISPLAY_NAME];
      const error = displayName?.length > 20;
      return error && INVALID_NAME;
    },
  },
];

// Settings page of Blackboard LMS config workflow
const BlackboardConfigAuthorizePage = () => {
  const { dispatch, stateMap } = useFormContext();
  return (
    <Container size='md'>
      <span className='d-flex pb-4'>
        <Image
          className="lms-icon mr-2"
          src={channelMapping[BLACKBOARD_TYPE].icon}
        />
        <h3>
          Authorize connection to Blackboard
        </h3>
      </span>
      <Form style={{ maxWidth: "60rem" }}>
        {stateMap?.[LMS_AUTHORIZATION_FAILED] && (
          <Alert variant="danger" icon={Info}>
            <h3>Enablement failed</h3>
            We were unable to enable your Blackboard integration. Please try again
            or contact enterprise customer support.
          </Alert>
        )}
        <Form.Group className="my-4.5">
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel="Display Name"
            fieldInstructions="Create a custom name for this LMS."
          />
        </Form.Group>
        <Form.Group className="my-4.5">
          <ValidatedFormControl
            formId={formFieldNames.BLACKBOARD_BASE_URL}
            type="text"
            maxLength={255}
            floatingLabel="Blackboard Base URL"
          />
        </Form.Group>
        <FormWaitModal
          triggerState={WAITING_FOR_ASYNC_OPERATION}
          onClose={() =>
            dispatch?.(
              setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false)
            )
          }
          header="Authorization in progress"
          text="Please confirm authorization through Blackboard and return to this window once complete."
        />
      </Form>
    </Container>
  );
};

export default BlackboardConfigAuthorizePage;
