import groupBy from "lodash/groupBy";
import isEmpty from "lodash/isEmpty";
// @ts-ignore
import { SET_FORM_FIELD, SET_STEP } from "./actions.ts";
import type { FormActionArguments, SetFormFieldArguments, SetStepArguments } from "./actions";
import type {
  FormContext,
  FormFields,
  FormFieldValidation,
} from "../FormContext";
import type { FormWorkflowStep } from "../FormWorkflow";

export type InitializeFormArguments = {
  formFields: FormFields;
  validations: FormFieldValidation[];
  currentStep: FormWorkflowStep
};
export const initializeForm = (
  state: FormContext,
  action: InitializeFormArguments
) => {
  const additions: Pick<FormContext, "isEdited" | "formFields" | "currentStep"> = { isEdited: false };
  if (action?.formFields) {
    additions.formFields = action.formFields;
  }
  if (action?.currentStep) {
    additions.currentStep = action.currentStep;
  }
  return {
    ...state,
    ...additions
  };
};

const processFormErrors = (state: FormContext): FormContext => {
  // Get all form errors
  // TODO: Get validations from step
  let errorState: Pick<FormContext, "hasErrors" | "errorMap"> = {
    hasErrors: false,
    errorMap: {},
  };
  if (state.formFields) {
    const errors = state.currentStep?.validations
      ?.map((validation: FormFieldValidation) => [
        validation.formFieldId,
        state.formFields && validation.validator(state.formFields),
      ])
      .filter((err) => !!err[1]);
    if (!isEmpty(errors)) {
      // Generate index of errors
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

const FormReducer = (state: FormContext = {formFields: {}}, action: FormActionArguments) => {
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
    case SET_STEP:
      const setStepArgs = action as SetStepArguments;
      return {...state, currentStep: setStepArgs.step};
    default:
      return state;
  }
};

export default FormReducer;
