import React, { useReducer } from "react";
import FormContextProvider from "./FormContext";
import type { FormFields } from "./FormContext";
import FormWorkflow from "./FormWorkflow";
import type { FormWorkflowProps } from "./FormWorkflow";
import {FormReducer, initializeForm } from "./data/reducer";
import type { FormActionArguments } from "./data/actions";

// Context wrapper for multi-step form container
function FormContextWrapper<FormData>({
  formWorkflowConfig,
  onClickOut,
  onSubmit,
  formData,
  isStepperOpen,
}: FormWorkflowProps<FormData>) {
  const [formFieldsState, dispatch] = useReducer<
    FormReducer,
    FormActionArguments
  >(
    FormReducer,
    initializeForm(
      {},
      {
        formFields: formData as FormFields,
        currentStep: formWorkflowConfig.getCurrentStep(),
      }
    ),
    initializeForm
  );
  return (
    <FormContextProvider
      dispatch={dispatch}
      formContext={formFieldsState || {}}
    >
      <FormWorkflow
        {...{ formWorkflowConfig, onClickOut, onSubmit, isStepperOpen, dispatch }}
      />
    </FormContextProvider>
  );
}

export default FormContextWrapper;
