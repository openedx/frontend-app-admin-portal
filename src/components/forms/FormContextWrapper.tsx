import React, { useReducer } from 'react';
import FormContextProvider from './FormContext';
import FormWorkflow, { DynamicComponent, FormWorkflowProps, UnsavedChangesModalProps } from './FormWorkflow';
import {
  FormReducer, FormReducerType, initializeForm, InitializeFormArguments,
} from './data/reducer';
import DefaultUnsavedChangesModal from '../settings/SettingsLMSTab/UnsavedChangesModal';

type FormWrapperProps<FormConfigData> = FormWorkflowProps<FormConfigData> & {
  formData: FormConfigData;
  unsavedChangesModal?: DynamicComponent<UnsavedChangesModalProps>;
};

const FormContextWrapper = <FormConfigData extends unknown>({
  workflowTitle,
  formWorkflowConfig,
  onClickOut,
  formData,
  isStepperOpen,
  UnsavedChangesModal,
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
          workflowTitle,
          formWorkflowConfig,
          onClickOut,
          isStepperOpen,
          dispatch,
          UnsavedChangesModal: UnsavedChangesModal || DefaultUnsavedChangesModal,
        }}
      />
    </FormContextProvider>
  );
};

export default FormContextWrapper;
