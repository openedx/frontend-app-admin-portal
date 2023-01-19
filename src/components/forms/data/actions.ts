import type { FormWorkflowStep } from "../FormWorkflow";

export type FormActionArguments = {
  type?: string;
};

export const SET_FORM_FIELD = "SET FORM FIELD";
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

export const SET_STEP = "SET STEP";
export type SetStepArguments = {
  step: FormWorkflowStep;
} & FormActionArguments;
// Construct action for setting a form field value
export const setStepAction = ({ step }: SetStepArguments) => ({
  type: SET_STEP,
  step,
});
