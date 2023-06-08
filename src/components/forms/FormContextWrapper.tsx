import React, { useReducer } from 'react';
import FormContextProvider from './FormContext';
import FormWorkflow, { FormWorkflowProps } from './FormWorkflow';
import {
  FormReducer, FormReducerType, initializeForm, InitializeFormArguments,
} from './data/reducer';

type FormWrapperProps<FormConfigData> = FormWorkflowProps<FormConfigData> & { formData: FormConfigData };

const FormContextWrapper = <FormConfigData extends unknown>({
  formWorkflowConfig,
  onClickOut,
  formData,
  isStepperOpen,
}: FormWrapperProps<FormConfigData>) => {
  const initializeAction: InitializeFormArguments<FormConfigData> = {
    formFields: formData as FormConfigData,
    currentStep: formWorkflowConfig.getCurrentStep(),
  };
  const [formFieldsState, dispatch] = useReducer<
  FormReducerType,
  InitializeFormArguments<FormConfigData>
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
          formWorkflowConfig, onClickOut, isStepperOpen, dispatch,
        }}
      />
    </FormContextProvider>
  );
};

export default FormContextWrapper;
