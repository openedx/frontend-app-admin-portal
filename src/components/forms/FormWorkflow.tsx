import React, { useEffect, useState } from 'react';
import type { Dispatch } from 'react';
import {
  ActionRow, Button, FullscreenModal, Spinner, Stepper, useToggle,
} from '@edx/paragon';
import { Launch } from '@edx/paragon/icons';

import { useFormContext } from './FormContext';
import type { FormFieldValidation, FormContext } from './FormContext';
import {
  FORM_ERROR_MESSAGE,
  FormActionArguments,
  setStepAction,
  setWorkflowStateAction,
  setShowErrorsAction,
  updateFormFieldsAction,
} from './data/actions';
import { HELP_CENTER_LINK, SUBMIT_TOAST_MESSAGE } from '../settings/data/constants';
import ConfigErrorModal from '../settings/ConfigErrorModal';
import { channelMapping, pollAsync } from '../../utils';
import HelpCenterButton from '../settings/HelpCenterButton';
import './_FormWorkflow.scss';

export const WAITING_FOR_ASYNC_OPERATION = 'WAITING FOR ASYNC OPERATION';

export type FormWorkflowErrorHandler = (errMsg: string) => void;

export type FormWorkflowHandlerArgs<FormData> = {
  formFields: FormData;
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
  onClick?: (args: FormWorkflowHandlerArgs<FormData>) => Promise<FormData> | void;
  awaitSuccess?: FormWorkflowAwaitHandler<FormData>;
};

export type DynamicComponent<Props> =
  | React.FunctionComponent<Props>
  | React.ComponentClass<Props>
  | React.ElementType<Props>;

export type FormWorkflowStep<FormData> = {
  index: number;
  stepName: string;
  formComponent: DynamicComponent<any>;
  validations: FormFieldValidation[];
  saveChanges?: (
    formData: FormData,
    errHandler: FormWorkflowErrorHandler
  ) => Promise<boolean>;
  nextButtonConfig: (FormData: FormData) => FormWorkflowButtonConfig<FormData>;
  showBackButton?: boolean;
  showCancelButton?: boolean;
};

export type FormWorkflowConfig<FormData> = {
  steps: FormWorkflowStep<FormData>[];
  getCurrentStep: () => FormWorkflowStep<FormData>;
};

export type UnsavedChangesModalProps = {
  isOpen: boolean;
  close: () => void;
  exitWithoutSaving?: () => void;
  saveDraft?: () => void
};

export type FormWorkflowProps<FormConfigData> = {
  workflowTitle: string;
  formWorkflowConfig: FormWorkflowConfig<FormConfigData>;
  onClickOut: (() => void) | ((edited?: boolean, msg?: string) => null);
  dispatch: Dispatch<FormActionArguments>;
  isStepperOpen: boolean;
  UnsavedChangesModal?: DynamicComponent<UnsavedChangesModalProps>;
};

// Modal container for multi-step forms
const FormWorkflow = <FormConfigData extends unknown>({
  workflowTitle,
  formWorkflowConfig,
  onClickOut,
  isStepperOpen,
  dispatch,
  UnsavedChangesModal,
}: FormWorkflowProps<FormConfigData>) => {
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
  const [helpCenterLink, setHelpCenterLink] = useState(HELP_CENTER_LINK);
  const [nextInProgress, setNextInProgress] = useState(false);
  const nextButtonConfig = step?.nextButtonConfig(formFields);
  const awaitingAsyncAction = stateMap && stateMap[WAITING_FOR_ASYNC_OPERATION];

  const setFormError = (msg: string) => {
    dispatch(setWorkflowStateAction(FORM_ERROR_MESSAGE, msg));
  };
  const clearFormError = () => setFormError('');

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
      // triggers rerender to have errors show up with
      dispatch(setStepAction({ step }));
    } else {
      let advance = true;
      if (nextButtonConfig && nextButtonConfig.onClick) {
        setNextInProgress(true);
        const newFormFields: FormConfigData = await nextButtonConfig.onClick({
          formFields,
          errHandler: setFormError,
          dispatch,
          formFieldsChanged: !!isEdited,
        });
        if (newFormFields) {
          dispatch(updateFormFieldsAction({ formFields: newFormFields }));
        }
        setNextInProgress(false);
        if (nextButtonConfig?.awaitSuccess) {
          advance = await pollAsync(
            () => nextButtonConfig.awaitSuccess?.awaitCondition?.({
              formFields: newFormFields,
              errHandler: setFormError,
              dispatch,
              formFieldsChanged: !!isEdited,
            }),
            nextButtonConfig.awaitSuccess.awaitTimeout,
            nextButtonConfig.awaitSuccess.awaitInterval,
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

  const onBack = () => {
    if (step?.index !== undefined) {
      const previousStep: number = step.index - 1;
      if (previousStep >= 0) {
        dispatch(setStepAction({ step: formWorkflowConfig.steps[previousStep] }));
      }
    }
  };

  const stepBody = (currentStep: FormWorkflowStep<FormConfigData>) => {
    if (currentStep) {
      const FormComponent: DynamicComponent<any> = currentStep?.formComponent;
      return (
        <Stepper.Step
          eventKey={currentStep.index.toString()}
          title={currentStep.stepName}
        >
          {/* there's a bug in paragon that reorders the steps when there's an error
        so we can't comment this back in until that is fixed
        hasError={showError}
        description={showError ? 'Error' : ''}> */}
          {step && step?.formComponent && <FormComponent />}
        </Stepper.Step>
      );
    }
    return null;
  };

  useEffect(() => {
    if (formFields?.channelCode) {
      setHelpCenterLink(channelMapping[formFields?.channelCode].helpCenter);
    }
  }, [formFields]);

  // Show back button only if showBackButton === true
  const showBackButton = (step?.index !== undefined) && (step.index > 0) && step.showBackButton;
  // Show cancel button by default
  const showCancelButton = step?.showCancelButton === undefined || step?.showCancelButton;
  let nextButtonContents = nextButtonConfig && (
    <>
      {nextButtonConfig.buttonText}
      {nextButtonConfig.opensNewWindow && <Launch className="ml-1" />}
    </>
  );
  if (nextInProgress) {
    // show spinner if Next button operation is ongoing
    nextButtonContents = <Spinner animation="border" size="sm" />;
  }
  return (
    <>
      <ConfigErrorModal
        isOpen={stateMap && stateMap[FORM_ERROR_MESSAGE]}
        close={clearFormError}
        configTextOverride={stateMap && stateMap[FORM_ERROR_MESSAGE]}
      />
      {/* @ts-ignore JSX element type 'UnsavedChangesModal' does not have any construct or call signatures. */}
      <UnsavedChangesModal
        isOpen={savedChangesModalIsOpen}
        close={closeSavedChangesModal}
        exitWithoutSaving={() => onClickOut(false)}
        saveDraft={async () => {
          if (step?.saveChanges) {
            await step?.saveChanges(formFields as FormConfigData, setFormError);
            onClickOut(true, SUBMIT_TOAST_MESSAGE);
          }
          onClickOut(false, 'No changes saved');
        }}
      />

      {formWorkflowConfig.steps && (
        <FullscreenModal
          title={workflowTitle}
          isOpen={isStepperOpen}
          onClose={onCancel}
          className="stepper-modal"
          footerNode={(
            <ActionRow>
              <HelpCenterButton url={helpCenterLink}>
                Help Center: Integrations
              </HelpCenterButton>
              <ActionRow.Spacer />
              {showCancelButton && <Button variant="tertiary" onClick={onCancel}>Cancel</Button>}
              {showBackButton && <Button variant="tertiary" onClick={onBack}>Back</Button>}
              {nextButtonConfig && (
                <Button className="next-button" onClick={onNext} disabled={nextInProgress || awaitingAsyncAction}>
                  {nextButtonContents}
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
};

export default FormWorkflow;
