import React from "react";
import type { Dispatch } from "react";
import { Button, Stepper, useToggle } from "@edx/paragon";
import { Launch } from "@edx/paragon/icons";

// @ts-ignore
import { useFormContext } from "./FormContext.tsx";
import type {
  FormFields,
  FormFieldValidation,
  FormContext,
} from "./FormContext";

import {
  setStepAction,
  setWorkflowStateAction,
  FORM_ERROR_MESSAGE,
  // @ts-ignore
} from "./data/actions.ts";
import { SUBMIT_TOAST_MESSAGE } from "../settings/data/constants";
import { FormActionArguments } from "./data/actions";
// @ts-ignore
import UnsavedChangesModal from "../settings/SettingsLMSTab/UnsavedChangesModal.tsx";
// @ts-ignore
import ConfigErrorModal from "../settings/ConfigErrorModal.tsx";
import { pollAsync } from "../../utils";

export const WAITING_FOR_ASYNC_OPERATION = "WAITING FOR ASYNC OPERATION";

export type FormWorkflowErrorHandler = (errMsg: string) => void;

export type FormWorkflowHandlerArgs<FormData> = {
  formFields?: FormData;
  formFieldsChanged: boolean;
  errHandler?: FormWorkflowErrorHandler;
  dispatch?: Dispatch<FormData>;
};

export type FormWorkflowAwaitHandler<FormData> = {
  awaitCondition: (args: FormWorkflowHandlerArgs<FormData>) => Promise<boolean>;
  awaitInterval: number;
  awaitTimeout: number;
  onAwaitTimeout?: (args: FormWorkflowHandlerArgs<FormData>) => void;
};

export type FormWorkflowButtonConfig<FormData> = {
  buttonText: string;
  opensNewWindow: boolean;
  onClick: (args: FormWorkflowHandlerArgs<FormData>) => Promise<FormData>;
  awaitSuccess?: FormWorkflowAwaitHandler<FormData>;
};

type DynamicComponent = React.FunctionComponent | React.ComponentClass;

export type FormWorkflowStep<FormData> = {
  index: number;
  stepName: string;
  formComponent: DynamicComponent;
  validations: FormFieldValidation[];
  saveChanges: (
    formData: FormData,
    errHandler: FormWorkflowErrorHandler
  ) => Promise<boolean>;
  nextButtonConfig: (FormData) => FormWorkflowButtonConfig<FormData>;
};

export type FormWorkflowConfig<FormData> = {
  steps: FormWorkflowStep<FormData>[];
  getCurrentStep: () => FormWorkflowStep<FormData>;
};

export type FormWorkflowProps<FormData> = {
  formWorkflowConfig: FormWorkflowConfig<FormData>;
  onClickOut: (edited: boolean, msg?: string) => null;
  formData: FormData;
  dispatch: Dispatch<FormActionArguments>;
  onSubmit: (FormData) => void;
};

// Modal container for multi-step forms
function FormWorkflow<FormData>({
  formWorkflowConfig,
  onClickOut,
  dispatch,
}: FormWorkflowProps<FormData>) {
  const {
    formFields,
    currentStep: step,
    hasErrors,
    isEdited,
    stateMap,
  }: FormContext = useFormContext();
  const [
    savedChangesModalIsOpen,
    openSavedChangesModal,
    closeSavedChangesModal,
  ] = useToggle(false);
  const nextButtonConfig = step?.nextButtonConfig(formFields);
  const awaitingAsyncAction = stateMap && stateMap[WAITING_FOR_ASYNC_OPERATION];

  const setFormError = (msg: string) => {
    dispatch(setWorkflowStateAction(FORM_ERROR_MESSAGE, msg));
  };
  const clearFormError = () => setFormError("");

  const onCancel = () => {
    if (isEdited) {
      openSavedChangesModal();
    } else {
      onClickOut(false);
    }
  };

  const onNext = async () => {
    let advance = true;
    if (nextButtonConfig) {
      let newFormFields: FormData = await nextButtonConfig.onClick({
        formFields,
        errHandler: setFormError,
        dispatch,
        formFieldsChanged: !!isEdited,
      });
      if (nextButtonConfig?.awaitSuccess) {
        advance = await pollAsync(
          () =>
            nextButtonConfig.awaitSuccess?.awaitCondition?.({
              formFields: newFormFields,
              errHandler: setFormError,
              dispatch,
              formFieldsChanged: !!isEdited,
            }),
          nextButtonConfig.awaitSuccess.awaitTimeout,
          nextButtonConfig.awaitSuccess.awaitInterval
        );
        if (!advance && nextButtonConfig?.awaitSuccess) {
          await nextButtonConfig.awaitSuccess?.onAwaitTimeout?.({
            formFields: newFormFields,
            errHandler: setFormError,
            dispatch,
            formFieldsChanged: !!isEdited,
          });
        }
      }
      if (advance && step) {
        const nextStep: number = step.index + 1;
        if (nextStep < formWorkflowConfig.steps.length) {
          dispatch(setStepAction({ step: formWorkflowConfig.steps[nextStep] }));
        } else {
          onClickOut(true, SUBMIT_TOAST_MESSAGE);
        }
      }
    }
  };

  const stepBody = (step: FormWorkflowStep<FormData>) => {
    const FormComponent: DynamicComponent = step?.formComponent;
    return (
      <Stepper.Step eventKey={step.index.toString()} title={step.stepName}>
        {step && step?.formComponent && <FormComponent />}
      </Stepper.Step>
    );
  };

  const stepActionRow = (step: FormWorkflowStep<FormData>) => {
    return (
      <Stepper.ActionRow eventKey={step.index.toString()}>
        <span className="d-flex">
          {/* TODO: Help Link */}
          {/* TODO: Fix typescript issue with Paragon Button */}
          {
            // @ts-ignore
            <Button
              onClick={onCancel}
              className="ml-auto mr-2"
              variant="outline-primary"
            >
              Cancel
            </Button>
          }
          {nextButtonConfig && (
            // @ts-ignore
            <Button
              onClick={onNext}
              disabled={hasErrors || awaitingAsyncAction}
            >
              {nextButtonConfig.buttonText}
              {nextButtonConfig.opensNewWindow && <Launch />}
            </Button>
          )}
        </span>
      </Stepper.ActionRow>
    );
  };

  return (
    <>
      <ConfigErrorModal
        isOpen={stateMap && stateMap[FORM_ERROR_MESSAGE]}
        close={clearFormError}
        configTextOverride={stateMap && stateMap[FORM_ERROR_MESSAGE]}
      />
      <UnsavedChangesModal
        isOpen={savedChangesModalIsOpen}
        close={closeSavedChangesModal}
        exitWithoutSaving={() => onClickOut(false)}
        saveDraft={async () => {
          await step?.saveChanges(formFields as FormData, setFormError);
          onClickOut(true, SUBMIT_TOAST_MESSAGE);
        }}
      />

      {formWorkflowConfig.steps && (
        <Stepper activeKey={step?.index.toString()}>
          <Stepper.Header />
          {formWorkflowConfig.steps.map((stepConfig) => stepBody(stepConfig))}
          {formWorkflowConfig.steps.map((stepConfig) =>
            stepActionRow(stepConfig)
          )}
        </Stepper>
      )}
    </>
  );
}

export default FormWorkflow;
