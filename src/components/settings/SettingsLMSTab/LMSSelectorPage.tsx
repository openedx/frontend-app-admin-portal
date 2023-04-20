import React from "react";

import { Container, Form, Image } from "@edx/paragon";

import {
  useFormContext,
  // @ts-ignore
} from "../../../../forms/FormContext.tsx";
import { FormFieldValidation } from "../../forms/FormContext";

export const formFieldNames = {
  LMS: "LMS",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.LMS,
    validator: (fields) => {
      const lmsSelection = fields[formFieldNames.LMS];
      return !lmsSelection;
    },
  },
];

// LMS selector form page
const LMSSelectorPage = () => {
  const { dispatch, stateMap } = useFormContext();
  return (
    <Container size='md'>
      <span className='d-flex pb-4'>
        <h3>
          Authorize connection to Canvas
        </h3>
      </span>
      <Form style={{ maxWidth: "60rem" }}>
        {/* TODO: Render the selector */}
      </Form>
    </Container>
  );
};

export default LMSSelectorPage;
