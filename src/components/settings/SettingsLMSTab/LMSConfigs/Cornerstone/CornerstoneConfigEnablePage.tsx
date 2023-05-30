import React from "react";

import { Container, Form, Image } from "@edx/paragon";

import { CORNERSTONE_TYPE, INVALID_LINK, INVALID_NAME } from "../../../data/constants";
// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
import { channelMapping, urlValidation } from "../../../../../utils";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  CORNERSTONE_BASE_URL: "cornerstoneBaseUrl",
  CORNERSTONE_FETCH_URL: "cornerstoneFetchUrl",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.CORNERSTONE_BASE_URL,
    validator: (fields) => {
      const cornerstoneUrl = fields[formFieldNames.CORNERSTONE_BASE_URL];
      if (cornerstoneUrl) {
        const error = !urlValidation(cornerstoneUrl);
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
      return !displayName;
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

// Settings page of Cornerstone LMS config workflow
const CornerstoneConfigEnablePage = () => {
  return (
    <Container size='md'>
      <span className='d-flex pb-4'>
        <Image
          className="lms-icon mr-2"
          src={channelMapping[CORNERSTONE_TYPE].icon}
        />
        <h3>
          Enable connection to Cornerstone
        </h3>
      </span>
      <Form style={{ maxWidth: "60rem" }}>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel="Display Name"
            fieldInstructions="Create a custom name for this LMS"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.CORNERSTONE_BASE_URL}
            type="text"
            maxLength={255}
            floatingLabel="Cornerstone Base URL"
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default CornerstoneConfigEnablePage;
