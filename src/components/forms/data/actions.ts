import type { FormWorkflowStep } from '../FormWorkflow';

export type FormActionArguments = {
  type?: string;
};

export const SET_FORM_FIELD = 'SET FORM FIELD';
export type SetFormFieldArguments = {
  // Id of form field
  fieldId: string;
  // Value to set form field to
  value: any;
} & FormActionArguments;
// Construct action for setting a form field value
export const setFormFieldAction = ({
  fieldId,
  value,
}: SetFormFieldArguments) => ({
  type: SET_FORM_FIELD,
  fieldId,
  value,
});

export const UPDATE_FORM_FIELDS = 'UPDATE FORM FIELDS';
export type UpdateFormFieldArguments<FormData> = {
  formFields: FormData;
} & FormActionArguments;
// Construct action for updating form fields
export function updateFormFieldsAction<FormData>({
  formFields,
}: UpdateFormFieldArguments<FormData>) {
  return {
    type: UPDATE_FORM_FIELDS,
    formFields,
  };
}

export const SET_SHOW_ERRORS = 'SET SHOW ERRORS';
export type SetShowErrorsArguments = {
  showErrors: boolean;
} & FormActionArguments;
// Construct action for setting a step
export const setShowErrorsAction = ({ showErrors }: SetShowErrorsArguments) => ({
  type: SET_SHOW_ERRORS,
  showErrors,
});

export const SET_STEP = 'SET STEP';
export type SetStepArguments<FormData> = {
  step: FormWorkflowStep<FormData>;
} & FormActionArguments;
// Construct action for setting a step
export const setStepAction = ({ step }: SetStepArguments<any>) => ({
  type: SET_STEP,
  step,
});

// Global Workflow state keys
export const FORM_ERROR_MESSAGE = 'FORM ERROR MESSAGE';

export const SET_WORKFLOW_STATE = 'SET WORKFLOW STATE';
export type SetWorkflowStateArguments<StateType> = {
  name: string;
  state: StateType;
} & FormActionArguments;
// Construct action for setting a flag for the workflow
export function setWorkflowStateAction<StateType>(
  name: string,
  state: StateType,
): SetWorkflowStateArguments<StateType> {
  return {
    type: SET_WORKFLOW_STATE,
    name,
    state,
  };
}
