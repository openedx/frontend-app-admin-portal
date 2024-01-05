import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import {
  SetShowErrorsArguments, SET_FORM_FIELD, SET_SHOW_ERRORS, SET_STEP, SET_WORKFLOW_STATE, UPDATE_FORM_FIELDS, SUBMIT_CONFIGURATION,
} from './actions';
import type {
  FormActionArguments, SetFormFieldArguments, SetStepArguments, SetWorkflowStateArguments, UpdateFormFieldArguments,
} from './actions';
import { FormContext, FormFields, FormFieldValidation } from '../FormContext';
import type { FormWorkflowStep } from '../FormWorkflow';

const processFormErrors = (state: FormContext): FormContext => {
  // Get all form errors
  let errorState: Pick<FormContext, 'hasErrors' | 'errorMap'> = {
    hasErrors: false,
    errorMap: {},
  };
  if (typeof state.currentStep?.validations === 'boolean') {
    errorState = { hasErrors: state.currentStep?.validations, errorMap: {} };
  } else if (state.formFields) {
    // Generate list of errors with their formFieldIds
    // const formFieldsCopy = {...state.formFields};
    const errors = state.currentStep?.validations
      ?.map((validation: FormFieldValidation) => [
        validation.formFieldId,
        state.formFields && validation.validator(state.formFields),
      ])
      .filter((err) => !!err[1]);
    if (!isEmpty(errors)) {
      // Convert to map of errors indexed by formFieldId
      const errorMap = groupBy(errors, (error) => error[0]);
      keys(errorMap).forEach((key) => {
        // Remove unneeded key from values now that we're grouping by it.
        errorMap[key] = errorMap[key].map(kvp => kvp[1]);
      });
      errorState = {
        hasErrors: true,
        errorMap,
      };
    } else {
      errorState = { hasErrors: false, errorMap: {} };
    }
  }

  return {
    ...state,
    ...errorState,
  };
};

export type InitializeFormArguments<FormFields> = {
  formFields: FormFields;
  validations?: FormFieldValidation[];
  currentStep: FormWorkflowStep<FormFields>;
  steps: FormWorkflowStep<FormFields>[];
};

export function initializeFormImpl<FormFields>(
  state: FormContext,
  action: InitializeFormArguments<FormFields>,
): FormContext {
  const additions: Pick<
  FormContext,
  'isEdited' | 'formFields' | 'currentStep'
  > = { isEdited: false };
  if (action?.formFields) {
    additions.formFields = action.formFields;
  }
  if (action?.currentStep) {
    additions.currentStep = action.currentStep;
  }
  return {
    ...(processFormErrors(state)),
    ...additions,
  };
}

export function initializeForm<FormFields>(action: InitializeFormArguments<FormFields>) {
  const initialFormState: Pick<
  FormContext,
  'isEdited' | 'formFields' | 'currentStep' | 'allSteps'
  > = { isEdited: false };
  if (action?.formFields) {
    initialFormState.formFields = action.formFields;
  }
  if (action?.currentStep) {
    initialFormState.currentStep = action.currentStep;
  }
  initialFormState.allSteps = action?.steps;
  return processFormErrors(initialFormState);
}

export type FormReducerType = (FormActionArguments, FormContext) => FormContext;

export const FormReducer: FormReducerType = (
  state: FormContext = { formFields: {} },
  action: FormActionArguments,
) => {
  switch (action.type) {
    case SET_FORM_FIELD: {
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
    } case UPDATE_FORM_FIELDS: {
      const updateFormFieldsArgs = action as UpdateFormFieldArguments<FormFields>;
      return {
        ...state,
        formFields: updateFormFieldsArgs.formFields,
        hasErrors: false,
        errorMap: {},
      };
    } case SUBMIT_CONFIGURATION: {
      return {
        ...state,
        isEdited: false,
      };
    } case SET_STEP: {
      const setStepArgs = action as SetStepArguments<FormFields>;
      const newStepState = { ...state, currentStep: setStepArgs.step };
      return processFormErrors(newStepState);
    } case SET_SHOW_ERRORS: {
      const SetShowErrorsArgs = action as SetShowErrorsArguments;
      return { ...state, showErrors: SetShowErrorsArgs.showErrors };
    } case SET_WORKFLOW_STATE: {
      const setStateArgs = action as SetWorkflowStateArguments<any>;
      const oldStateMap = state.stateMap || {};
      const newStateMap = {
        ...oldStateMap,
        [setStateArgs.name]: setStateArgs.state,
      };
      return { ...state, stateMap: newStateMap };
    } default:
      return state;
  }
};
