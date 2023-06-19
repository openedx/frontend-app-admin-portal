import React, {
  Context, Dispatch, createContext, ReactNode, useContext, useMemo,
} from 'react';

import type { FormActionArguments } from './data/actions';
import type { FormWorkflowStep } from './FormWorkflow';

export type FormFields = { [name: string]: any };
export type FormValidatorResult = boolean | string;
export type FormValidator = (formFields: FormFields) => FormValidatorResult;
export type FormFieldValidation = {
  formFieldId?: string;
  validator: FormValidator;
};

export type FormContext = {
  dispatch?: Dispatch<FormActionArguments>;
  formFields?: FormFields;
  isEdited?: boolean;
  hasErrors?: boolean;
  showErrors?: boolean;
  errorMap?: { [name: string]: string[] };
  stateMap?: { [name: string]: any };
  currentStep?: FormWorkflowStep<any>;
};

export const FormContextObject: Context<FormContext> = createContext({});

export function useFormContext(): FormContext {
  return useContext(FormContextObject);
}

type FormContextProps = {
  children: ReactNode;
  formContext: FormContext;
  dispatch?: Dispatch<FormActionArguments>;
};

// Context wrapper for all form components
const FormContextProvider = ({
  children,
  dispatch,
  formContext,
}: FormContextProps) => {
  const memoValue = useMemo(() => (
    { ...formContext, dispatch }
  ), [formContext, dispatch]);
  return (
    <FormContextObject.Provider value={memoValue}>
      {children}
    </FormContextObject.Provider>
  );
};

export default FormContextProvider;
