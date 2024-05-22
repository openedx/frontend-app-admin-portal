import React from 'react';
import omit from 'lodash/omit';
import isString from 'lodash/isString';

import { Form } from '@openedx/paragon';

import { setFormFieldAction } from './data/actions';
import { useFormContext } from './FormContext';

type InheritedParagonCheckboxProps = {
  className?: string;
  children: string;
};

export type ValidatedFormCheckboxProps = {
  // Field id, required to map to field in FormContext
  formId: string;
  // Inline Instructions inside form field when blank
  fieldInstructions?: string;
  label?: string;
  options?: string[][];
  isInline?: boolean;
} & InheritedParagonCheckboxProps;

const ValidatedFormCheckbox = (props: ValidatedFormCheckboxProps) => {
  const {
    showErrors, formFields, errorMap, dispatch,
  } = useFormContext();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (dispatch) {
      dispatch(setFormFieldAction({ fieldId: props.formId, value: e.target.checked }));
    }
  };
  const value = formFields?.[props?.formId];
  const errors = errorMap?.[props.formId];
  // Show error message if an error message was part of any detected errors
  const errorShown = errors?.find?.(error => isString(error));
  const formCheckboxProps = {
    ...omit(props, ['formId']),
    onChange,
    isInvalid: showErrors && errorShown,
    id: props.formId,
    value: formFields && formFields[props.formId],
  };

  return (
    <>
      <Form.Label {...formCheckboxProps}>{formCheckboxProps.label}</Form.Label>
      <Form.Checkbox {...formCheckboxProps} checked={value} onChange={onChange} />
      {formCheckboxProps.fieldInstructions && (
        <Form.Text>{formCheckboxProps.fieldInstructions}</Form.Text>
      )}
      {showErrors && errorShown && (
        <Form.Control.Feedback type="invalid">{errorShown}</Form.Control.Feedback>
      )}
    </>
  );
};

export default ValidatedFormCheckbox;
