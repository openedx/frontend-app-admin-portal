import React from "react";
import omit from "lodash/omit";
import isString from "lodash/isString";

import { Form } from "@edx/paragon";

import { setFormFieldAction } from "./data/actions";
import { useFormContext } from "./FormContext";

type InheritedParagonControlProps = {
  className?: string;
  type: string;
  maxLength?: number;
  floatingLabel: string | undefined;
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
  const errors = errorMap?.[props.formId];
  // Show error message if an error message was part of any detected errors
  const showError = errors?.find?.(error => isString(error));
  const formControlProps = {
    ...omit(props, ["formId"]),
    onChange,
    isInvalid: showError,
    id: props.formId,
    value: formFields && formFields[props.formId],
  };
  return (
    <>
      <Form.Control {...formControlProps} />
      {props.fieldInstructions && (
        <Form.Text>{props.fieldInstructions}</Form.Text>
      )}
      {showError && (
        <Form.Control.Feedback type="invalid">{showError}</Form.Control.Feedback>
      )}
    </>
  );
};

export default ValidatedFormControl;
