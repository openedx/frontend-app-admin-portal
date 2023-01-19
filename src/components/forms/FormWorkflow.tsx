import React from "react";
import type { SyntheticEvent, Dispatch } from "react";
import { Button, Form, Stepper, useToggle } from "@edx/paragon";

import ConfigError from "../settings/ConfigError";
// @ts-ignore
import { useFormContext } from "./FormContext.tsx";
import type {
  FormFields,
  FormFieldValidation,
  FormContext,
} from "./FormContext";
// @ts-ignore
import { setStepAction } from "./data/actions.ts";
import { SUBMIT_TOAST_MESSAGE } from "../settings/data/constants";
import { FormActionArguments } from "./data/actions";
// @ts-ignore
import UnsavedChangesModal from "../settings/SettingsLMSTab/UnsavedChangesModal.tsx";

export type FormWorkflowButtonConfig<FormData> = {
  buttonText: string;
  onClick: (formFields: FormData) => Promise<void>;
};

type DynamicComponent = React.FunctionComponent | React.ComponentClass;

export type FormWorkflowStep<FormData> = {
  index: number;
  stepName: string;
  formComponent: DynamicComponent;
  validations: FormFieldValidation[];
  saveChanges: (FormData) => Promise<void>;
  nextButtonConfig: FormWorkflowButtonConfig<FormData>;
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
  }: FormContext = useFormContext();
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [savedChangesModalIsOpen, openModal, closeModal] = useToggle(false);

  const onCancel = () => {
    if (isEdited) {
      openModal();
    } else {
      onClickOut(false);
    }
  };

  const onNext = async (event: SyntheticEvent) => {
    await step?.nextButtonConfig.onClick(formFields as FormFields);
    const nextStep: number = step.index + 1;
    if (nextStep < formWorkflowConfig.steps.length) {
      dispatch(setStepAction({ step: formWorkflowConfig.steps[nextStep] }));
    } else {
      // TODO: Fix
      onClickOut(true, SUBMIT_TOAST_MESSAGE);
    }
  };

  const stepBody = (step: FormWorkflowStep<FormData>) => {
    const FormComponent: DynamicComponent = step?.formComponent;
    return (
      <Stepper.Step eventKey={step.index.toString()} title={step.stepName}>
        <span>
          {step && step?.formComponent && (
            <>
              <FormComponent />
            </>
          )}
        </span>
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
          {step.nextButtonConfig && (
            // @ts-ignore
            <Button onClick={onNext} disabled={hasErrors}>
              {step.nextButtonConfig.buttonText}
            </Button>
          )}
        </span>
      </Stepper.ActionRow>
    );
  };

  return (
    <>
      <ConfigError isOpen={errorIsOpen} close={closeError} />
      <UnsavedChangesModal
        isOpen={savedChangesModalIsOpen}
        close={closeModal}
        exitWithoutSaving={() => onClickOut(false)}
        saveDraft={async () => {
          await step?.saveChanges(formFields as FormData);
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
