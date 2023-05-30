import React from "react";

import { Container, Form, Image } from "@edx/paragon";

// @ts-ignore
import ValidatedFormControl from "../../../../forms/ValidatedFormControl.tsx";
// @ts-ignore
import ValidatedFormRadio from "../../../../forms/ValidatedFormRadio.tsx";
import { channelMapping, urlValidation } from "../../../../../utils";
import { INVALID_LINK, INVALID_NAME, SAP_TYPE } from "../../../data/constants";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  SAPSF_BASE_URL: "sapsfBaseUrl",
  SAPSF_COMPANY_ID: "sapsfCompanyId",
  SAPSF_USER_ID: "sapsfUserId",
  KEY: "key",
  SECRET: "secret",
  USER_TYPE: "userType",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.SAPSF_BASE_URL,
    validator: (fields) => {
      const sapUrl = fields[formFieldNames.SAPSF_BASE_URL];
      if (sapUrl) {
        const error = !urlValidation(sapUrl);
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
  {
    formFieldId: formFieldNames.SAPSF_COMPANY_ID,
    validator: (fields) => {
      const sapsfCompanyId = fields[formFieldNames.SAPSF_COMPANY_ID];
      return !sapsfCompanyId;
    },
  },
  {
    formFieldId: formFieldNames.SAPSF_USER_ID,
    validator: (fields) => {
      const sapsfUserId = fields[formFieldNames.SAPSF_USER_ID];
      return !sapsfUserId;
    },
  },
  {
    formFieldId: formFieldNames.KEY,
    validator: (fields) => {
      const key = fields[formFieldNames.KEY];
      return !key;
    },
  },
  {
    formFieldId: formFieldNames.SECRET,
    validator: (fields) => {
      const secret = fields[formFieldNames.SECRET];
      return !secret;
    },
  },
  {
    formFieldId: formFieldNames.USER_TYPE,
    validator: (fields) => {
      const userType = fields[formFieldNames.USER_TYPE];
      return !userType;
    },
  },
];

const SAPConfigEnablePage = () => {
  return (
    <Container size='md'>
      <span className='d-flex pb-4'>
        <Image
          className="lms-icon mr-2"
          src={channelMapping[SAP_TYPE].icon}
        />
        <h3>
          Enable connection to SAP Success Factors
        </h3>
      </span>
      <Form style={{ maxWidth: "60rem" }}>
        <Form.Group className="my-2.5">
          <ValidatedFormControl
            formId={formFieldNames.DISPLAY_NAME}
            type="text"
            floatingLabel="Display Name"
            fieldInstructions="Create a custom name for this LMS"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SAPSF_BASE_URL}
            type="text"
            maxLength={255}
            floatingLabel="SAP Base URL"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SAPSF_COMPANY_ID}
            type="text"
            maxLength={255}
            floatingLabel="SAP Company ID"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SAPSF_USER_ID}
            type="text"
            maxLength={255}
            floatingLabel="SAP User ID"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.KEY}
            type="text"
            maxLength={255}
            floatingLabel="OAuth Client ID"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SECRET}
            type="password"
            maxLength={255}
            floatingLabel="OAuth Client Secret"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormRadio
            formId={formFieldNames.USER_TYPE}
            label="SAP User Type"
            options={[["User", "user"],["Admin", "admin"]]}
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default SAPConfigEnablePage;
