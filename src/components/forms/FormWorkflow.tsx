import React, { useEffect, useState } from "react";
import type { Dispatch } from "react";
import { ActionRow, Button, FullscreenModal, Hyperlink, Stepper, useToggle } from "@edx/paragon";
import { Launch } from "@edx/paragon/icons";

// @ts-ignore
import { FormFields, useFormContext } from "./FormContext.tsx";
import type { FormFieldValidation, FormContext } from "./FormContext";
// @ts-ignore
import { setStepAction, setWorkflowStateAction, FORM_ERROR_MESSAGE, setShowErrorsAction } from "./data/actions.ts";
import { HELP_CENTER_LINK, SUBMIT_TOAST_MESSAGE } from "../settings/data/constants";
import { FormActionArguments } from "./data/actions";
// @ts-ignore
import UnsavedChangesModal from "../settings/SettingsLMSTab/UnsavedChangesModal.tsx";
// @ts-ignore
import ConfigErrorModal from "../settings/ConfigErrorModal.tsx";
import { channelMapping, pollAsync } from "../../utils";
// @ts-ignore
import { InitializeFormArguments, initializeForm } from "./data/reducer.ts";

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

type DynamicComponent = React.FunctionComponent | React.ComponentClass | React.ElementType;

export type FormWorkflowStep<FormData> = {
  index: number;
  stepName: string;
  formComponent: DynamicComponent;
  validations: FormFieldValidation[];
  saveChanges: (
    formData: FormData,
    errHandler: FormWorkflowErrorHandler
  ) => Promise<boolean>;
  nextButtonConfig: (FormData: FormData) => FormWorkflowButtonConfig<FormData>;
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
  onSubmit: (FormData: FormData) => void;
  isStepperOpen: boolean;
};

// Modal container for multi-step forms
function FormWorkflow<FormData>({
  formWorkflowConfig,
  onClickOut,
  isStepperOpen,
  dispatch,
}: FormWorkflowProps<FormData>) {
  const {
    formFields,
    currentStep: step,
    hasErrors,
    showErrors,
    isEdited,
    stateMap,
  }: FormContext = useFormContext();
  const [
    savedChangesModalIsOpen,
    openSavedChangesModal,
    closeSavedChangesModal,
  ] = useToggle(false);
  const [helpCenterLink, setHelpCenterLink] = useState(HELP_CENTER_LINK);
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
    if (hasErrors && step) {
      dispatch(setShowErrorsAction({ showErrors: true }));
      //triggers rerender to have errors show up with 
      dispatch(setStepAction({ step: step }));
    } else {
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
            nextButtonConfig.awaitSuccess?.onAwaitTimeout?.({
              formFields: newFormFields,
              errHandler: setFormError,
              dispatch,
              formFieldsChanged: !!isEdited,
            });
          }
        }
        if (advance && step) {
          dispatch(setShowErrorsAction({ showErrors: false }));
          const nextStep: number = step.index + 1;
          if (nextStep < formWorkflowConfig.steps.length) {
            dispatch(setStepAction({ step: formWorkflowConfig.steps[nextStep] }));
          } else {
            onClickOut(true, SUBMIT_TOAST_MESSAGE);
          }
        }
      }
    }
  };

  const stepBody = (step: FormWorkflowStep<FormData>) => {
    const FormComponent: DynamicComponent = step?.formComponent;
    return (
      <Stepper.Step
        eventKey={step.index.toString()}
        title={step.stepName}>
        {/* there's a bug in paragon that reorders the steps when there's an error
        so we can't comment this back in until that is fixed
        hasError={showError}
        description={showError ? 'Error' : ''}> */}
        {step && step?.formComponent && <FormComponent />}
      </Stepper.Step>
    );
  };

  useEffect(() => {
    if (formFields?.channelCode) {
      setHelpCenterLink(channelMapping[formFields?.channelCode].helpCenter);
    }
  }, [formFields]);

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
        <FullscreenModal
          title="New learning platform integration"
          isOpen={isStepperOpen}
          onClose={onCancel}
          className='stepper-modal'
          footerNode={(
            <ActionRow>
              <Hyperlink
                destination={helpCenterLink}
                className="btn btn-outline-tertiary"
                target="_blank"
              >
                Help Center: Integrations
              </Hyperlink>
              <ActionRow.Spacer />
              <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
              {nextButtonConfig && (
                <Button onClick={onNext} disabled={awaitingAsyncAction}>
                  {nextButtonConfig.buttonText}
                  {nextButtonConfig.opensNewWindow && <Launch className="ml-1" />}
                </Button>
              )}
            </ActionRow>
          )}
        >
          <Stepper activeKey={step?.index.toString()}>
            <Stepper.Header />
            {formWorkflowConfig.steps.map((stepConfig) => stepBody(stepConfig))}
          </Stepper>
        </FullscreenModal>
      )}
    </>
  );
}

export default FormWorkflow;
