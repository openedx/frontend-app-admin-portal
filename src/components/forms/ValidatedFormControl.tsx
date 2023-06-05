import React, { useEffect } from 'react';
import omit from 'lodash/omit';
import isString from 'lodash/isString';

import { Form } from '@edx/paragon';

import { setFormFieldAction } from './data/actions';
import { useFormContext } from './FormContext';

type InheritedParagonControlProps = {
  autoFocus?: boolean;
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
  const {
    showErrors, formFields, errorMap, dispatch,
  } = useFormContext();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (dispatch) {
      dispatch(
        setFormFieldAction({ fieldId: props.formId, value: e.target.value }),
      );
    }
  };
  const errors = errorMap?.[props.formId];
  // Show error message if an error message was part of any detected errors
  const showError = errors?.find?.(error => isString(error));
  const formControlProps = {
    ...omit(props, ['formId']),
    onChange,
    isInvalid: showErrors && showError,
    id: props.formId,
    value: formFields && formFields[props.formId],
  };
  // we need to set the original values on load in order to trigger the validation
  useEffect(() => {
    if (dispatch) {
      dispatch(
        setFormFieldAction({ fieldId: props.formId, value: formControlProps.value }),
      );
    }
  }, [dispatch, props.formId, formControlProps.value]);
  return (
    <>
      <Form.Control {...formControlProps} />
      {props.fieldInstructions && !(showError && showErrors) && (
        <Form.Text>{props.fieldInstructions}</Form.Text>
      )}
      {showErrors && showError && (
        <Form.Control.Feedback type="invalid">{showError}</Form.Control.Feedback>
      )}
    </>
  );
};

export default ValidatedFormControl;
