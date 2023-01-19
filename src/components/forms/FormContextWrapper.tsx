import React, { useReducer } from "react";
// @ts-ignore
import FormContextProvider from "./FormContext.tsx";
import type { FormFields } from "./FormContext";
// @ts-ignore
import FormWorkflow from "./FormWorkflow.tsx";
import type { FormWorkflowProps } from "./FormWorkflow";
// @ts-ignore
import FormReducer, { initializeForm } from "./data/reducer.ts";
import type { FormActionArguments } from "./data/actions";

// Context wrapper for multi-step form container
function FormContextWrapper<FormData>({
  formWorkflowConfig,
  onClickOut,
  onSubmit,
  formData,
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
        {...{ formWorkflowConfig, onClickOut, onSubmit, dispatch }}
      />
    </FormContextProvider>
  );
}

export default FormContextWrapper;
