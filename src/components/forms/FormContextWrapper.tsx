import React, { useReducer } from 'react';
import FormContextProvider from './FormContext';
import FormWorkflow from './FormWorkflow';
import type { FormWorkflowProps } from './FormWorkflow';
import {
  FormReducer, FormReducerType, initializeForm, InitializeFormArguments,
} from './data/reducer';

// Context wrapper for multi-step form container
function FormContextWrapper<FormData>({
  formWorkflowConfig,
  onClickOut,
  onSubmit,
  formData,
  isStepperOpen,
}: FormWorkflowProps<FormData>) {
  const initializeAction: InitializeFormArguments<FormData> = {
    formFields: formData as FormData,
    currentStep: formWorkflowConfig.getCurrentStep(),
  };
  const [formFieldsState, dispatch] = useReducer<
  FormReducerType,
  InitializeFormArguments<FormData>
  >(
    FormReducer,
    initializeAction,
    initializeForm,
  );
  return (
    <FormContextProvider
      dispatch={dispatch}
      formContext={formFieldsState || {}}
    >
      <FormWorkflow
        {...{
          formWorkflowConfig, onClickOut, onSubmit, isStepperOpen, dispatch,
        }}
      />
    </FormContextProvider>
  );
}

export default FormContextWrapper;
