import groupBy from "lodash/groupBy";
import isEmpty from "lodash/isEmpty";
import {
  SET_FORM_FIELD,
  SET_STEP,
  SET_WORKFLOW_STATE,
  UPDATE_FORM_FIELDS,
// @ts-ignore
} from "./actions.ts";
import type {
  FormActionArguments,
  SetFormFieldArguments,
  SetStepArguments,
  SetWorkflowStateArguments,
  UpdateFormFieldArguments,
} from "./actions";
import type { FormContext, FormFieldValidation } from "../FormContext";
import type { FormWorkflowStep } from "../FormWorkflow";

export type InitializeFormArguments<FormFields> = {
  formFields: FormFields;
  validations: FormFieldValidation[];
  currentStep: FormWorkflowStep<FormFields>;
};
export function initializeForm<FormFields>(
  state: FormContext,
  action: InitializeFormArguments<FormFields>
) {
  const additions: Pick<
    FormContext,
    "isEdited" | "formFields" | "currentStep"
  > = { isEdited: false };
  if (action?.formFields) {
    additions.formFields = action.formFields;
  }
  if (action?.currentStep) {
    additions.currentStep = action.currentStep;
  }
  return {
    ...state,
    ...additions,
  };
}

const processFormErrors = (state: FormContext): FormContext => {
  // Get all form errors
  let errorState: Pick<FormContext, "hasErrors" | "errorMap"> = {
    hasErrors: false,
    errorMap: {},
  };
  if (state.formFields) {
    // Generate list of errors with their formFieldIds
    const errors = state.currentStep?.validations
      ?.map((validation: FormFieldValidation) => [
        validation.formFieldId,
        state.formFields && validation.validator(state.formFields),
      ])
      .filter((err) => !!err[1]);
    if (!isEmpty(errors)) {
      // Convert to map of errors indexed by formFieldId
      errorState = {
        hasErrors: true,
        errorMap: groupBy(errors, (error) => error[0]),
      };
    }
  }

  return {
    ...state,
    ...errorState,
  };
};

export function FormReducer<FormFields>(
  state: FormContext = { formFields: {} },
  action: FormActionArguments
) {
  switch (action.type) {
    case SET_FORM_FIELD:
      const setFormFieldArgs = action as SetFormFieldArguments;
      let newState = state ? { ...state } : { formFields: {} };
      if (newState.formFields) {
        newState.formFields[setFormFieldArgs.fieldId] = setFormFieldArgs.value;
      }
      newState = processFormErrors({
        ...state,
        isEdited: true,
      });
      return newState;
    case UPDATE_FORM_FIELDS:
      const updateFormFieldsArgs =
        action as UpdateFormFieldArguments<FormFields>;
      return {
        ...state,
        formFields: updateFormFieldsArgs.formFields,
        isEdited: false,
        hasErrors: false,
      };
    case SET_STEP:
      const setStepArgs = action as SetStepArguments<FormFields>;
      return { ...state, currentStep: setStepArgs.step };
    case SET_WORKFLOW_STATE:
      const setStateArgs = action as SetWorkflowStateArguments<any>;
      const oldStateMap = state.stateMap || {};
      const newStateMap = {
        ...oldStateMap,
        [setStateArgs.name]: setStateArgs.state,
      };
      return { ...state, stateMap: newStateMap };
    default:
      return state;
  }
}
