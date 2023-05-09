import React from "react";

import { Container, Form, Image } from "@edx/paragon";

import ValidatedFormControl from "../../../../forms/ValidatedFormControl";
import ValidatedFormRadio from "../../../../forms/ValidatedFormRadio";
import { channelMapping, urlValidation } from "../../../../../utils";
import { INVALID_LINK, INVALID_NAME, SAP_TYPE } from "../../../data/constants";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";

export const formFieldNames = {
  DISPLAY_NAME: "displayName",
  SAP_BASE_URL: "sapBaseUrl",
  SAP_COMPANY_ID: "sapCompanyId",
  SAP_USER_ID: "sapUserId",
  OAUTH_CLIENT_ID: "oauthClientId",
  OAUTH_CLIENT_SECRET: "oauthClientSecret",
  SAP_USER_TYPE: "sapUserType",
};

export const validations: FormFieldValidation[] = [
  {
    formFieldId: formFieldNames.SAP_BASE_URL,
    validator: (fields) => {
      const sapUrl = fields[formFieldNames.SAP_BASE_URL];
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
    formFieldId: formFieldNames.SAP_COMPANY_ID,
    validator: (fields) => {
      const sapCompanyId = fields[formFieldNames.SAP_COMPANY_ID];
      return !sapCompanyId;
    },
  },
  {
    formFieldId: formFieldNames.SAP_USER_ID,
    validator: (fields) => {
      const sapUserId = fields[formFieldNames.SAP_USER_ID];
      return !sapUserId;
    },
  },
  {
    formFieldId: formFieldNames.OAUTH_CLIENT_ID,
    validator: (fields) => {
      const oauthClientId = fields[formFieldNames.OAUTH_CLIENT_ID];
      return !oauthClientId;
    },
  },
  {
    formFieldId: formFieldNames.OAUTH_CLIENT_SECRET,
    validator: (fields) => {
      const secret = fields[formFieldNames.OAUTH_CLIENT_SECRET];
      return !secret;
    },
  },
  {
    formFieldId: formFieldNames.SAP_USER_TYPE,
    validator: (fields) => {
      const sapUserType = fields[formFieldNames.SAP_USER_TYPE];
      return !sapUserType;
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
            fieldInstructions="Create a custom name for this LMS."
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SAP_BASE_URL}
            className="mb-4"
            type="text"
            maxLength={255}
            floatingLabel="SAP Base URL"
          />
        </Form.Group>
        <Form.Group>
          <ValidatedFormControl
            formId={formFieldNames.SAP_COMPANY_ID}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="SAP Company ID"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.SAP_USER_ID}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="SAP User ID"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.OAUTH_CLIENT_ID}
            className="my-4"
            type="text"
            maxLength={255}
            floatingLabel="OAuth Client ID"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormControl
            formId={formFieldNames.OAUTH_CLIENT_SECRET}
            className="my-4"
            type="password"
            maxLength={255}
            floatingLabel="OAuth Client Secret"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <ValidatedFormRadio
            formId={formFieldNames.SAP_USER_TYPE}
            className="my-4"
            label="SAP User Type"
            options={[["User", "user"],["Admin", "admin"]]}
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default SAPConfigEnablePage;
