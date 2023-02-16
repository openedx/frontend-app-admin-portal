import React from "react";
import omit from "lodash/omit";

import { Form } from "@edx/paragon";

// @ts-ignore
import { setFormFieldAction } from "./data/actions.ts";
// @ts-ignore
import { useFormContext } from "./FormContext.tsx";

// TODO: Add Form.Control props.  Does Paragon export?
type InheritedParagonControlProps = {
  className?: string;
  type: string;
  maxLength?: number;
  floatingLabel: string;
};

export type ValidatedFormControlProps = {
  // Field id, required to map to field in FormContext
  formId: string;
  // Inline Instructions inside form field when blank
  fieldInstructions?: string;
} & InheritedParagonControlProps;

// Control that reads from/writes to form context store
const ValidatedFormControl = (props: ValidatedFormControlProps) => {
  const { formFields, errorMap, dispatch } = useFormContext();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch && dispatch(
      setFormFieldAction({ fieldId: props.formId, value: e.target.value })
    );
  };
  const error = errorMap && errorMap[props.formId];
  const formControlProps = {
    ...omit(props, ["formId"]),
    onChange,
    isInvalid: !!error,
    id: props.formId,
    value: formFields && formFields[props.formId],
  };
  return (
    <>
      <Form.Control {...formControlProps} />
      {props.fieldInstructions && (
        <Form.Text>{props.fieldInstructions}</Form.Text>
      )}
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </>
  );
};

export default ValidatedFormControl;
