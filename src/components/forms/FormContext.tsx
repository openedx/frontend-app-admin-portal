import React, { createContext, useContext, Context, ReactNode, Dispatch } from "react";
import type { FormActionArguments } from "./data/actions";
import type { FormWorkflowStep } from "./FormWorkflow";

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
  return (
    <FormContextObject.Provider value={{ ...formContext, dispatch }}>
      {children}
    </FormContextObject.Provider>
  );
};

export default FormContextProvider;
