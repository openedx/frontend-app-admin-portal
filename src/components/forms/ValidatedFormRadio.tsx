import React from "react";
import omit from "lodash/omit";
import isString from "lodash/isString";

import { Form } from "@edx/paragon";

// @ts-ignore
import { setFormFieldAction } from "./data/actions.ts";
// @ts-ignore
import { useFormContext } from "./FormContext.tsx";

type InheritedParagonRadioProps = {
  className?: string;
};

export type ValidatedFormRadioProps = {
  // Field id, required to map to field in FormContext
  formId: string;
  // Inline Instructions inside form field when blank
  fieldInstructions?: string;
  label: string;
  options: string[][]
} & InheritedParagonRadioProps;

const ValidatedFormRadio = (props: ValidatedFormRadioProps) => {
  const { formFields, errorMap, dispatch } = useFormContext();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch && dispatch(
      setFormFieldAction({ fieldId: props.formId, value: e.target.value })
    );
  };

  const errors = errorMap?.[props.formId];
  // Show error message if an error message was part of any detected errors
  const showError = errors?.find?.(error => isString(error));
  const formRadioProps = {
    ...omit(props, ["formId"]),
    onChange,
    isInvalid: showError,
    id: props.formId,
    value: formFields && formFields[props.formId],
  };

  const createOptions = (options: string[][]) => {
    const optionList: any = []
    options?.forEach(option => {   
      const radioLabel = option[0]
      const radioValue = option[1]
      optionList.push(
        <Form.Radio key={`radio-selection-${radioValue}`} value={radioValue}>
          {radioLabel}
        </Form.Radio>
      )
    })
    return optionList
  }

  return (
    <>
      <Form.Label>{formRadioProps.label}</Form.Label>
      <Form.RadioSet
        name={formRadioProps.id}
        onChange={formRadioProps.onChange}
        isInline
      >
        {createOptions(formRadioProps.options)}
      </Form.RadioSet>
      {formRadioProps.fieldInstructions && (
        <Form.Text>{formRadioProps.fieldInstructions}</Form.Text>
      )}
      {showError && (
        <Form.Control.Feedback type="invalid">{showError}</Form.Control.Feedback>
      )}
    </>
  );
};

export default ValidatedFormRadio;
