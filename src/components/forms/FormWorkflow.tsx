import React, { useEffect, useState } from 'react';
import type { Dispatch } from 'react';
import {
  ActionRow, Button, FullscreenModal, Hyperlink, Stepper, useToggle,
} from '@edx/paragon';
import { Launch } from '@edx/paragon/icons';

import { useFormContext } from './FormContext';
import type { FormFieldValidation, FormContext } from './FormContext';
import {
  FORM_ERROR_MESSAGE, FormActionArguments, setStepAction, setWorkflowStateAction, setShowErrorsAction,
} from './data/actions';
import { HELP_CENTER_LINK, SUBMIT_TOAST_MESSAGE } from '../settings/data/constants';
import UnsavedChangesModal from '../settings/SettingsLMSTab/UnsavedChangesModal';
import ConfigErrorModal from '../settings/ConfigErrorModal';
import { channelMapping, pollAsync } from '../../utils';

export const WAITING_FOR_ASYNC_OPERATION = 'WAITING FOR ASYNC OPERATION';

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
  onClick?: (args: FormWorkflowHandlerArgs<FormData>) => Promise<FormData> | void;
  awaitSuccess?: FormWorkflowAwaitHandler<FormData>;
};

type DynamicComponent = React.FunctionComponent | React.ComponentClass | React.ElementType;

export type FormWorkflowStep<FormData> = {
  index: number;
  stepName: string;
  formComponent: DynamicComponent;
  validations: FormFieldValidation[];
  saveChanges?: (
    formData: FormData,
    errHandler: FormWorkflowErrorHandler
  ) => Promise<boolean>;
  nextButtonConfig: (FormData: FormData) => FormWorkflowButtonConfig<FormData>;
};

export type FormWorkflowConfig<FormData> = {
  steps: FormWorkflowStep<FormData>[];
  getCurrentStep: () => FormWorkflowStep<FormData>;
};

export type FormWorkflowProps<FormConfigData> = {
  formWorkflowConfig: FormWorkflowConfig<FormConfigData>;
  onClickOut: (edited: boolean, msg?: string) => null;
  dispatch: Dispatch<FormActionArguments>;
  isStepperOpen: boolean;
};

// Modal container for multi-step forms
const FormWorkflow = <FormConfigData extends unknown>({
  formWorkflowConfig,
  onClickOut,
  isStepperOpen,
  dispatch,
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
    console.log('on next');
    if (hasErrors && step) {
      dispatch(setShowErrorsAction({ showErrors: true }));
      // triggers rerender to have errors show up with
      dispatch(setStepAction({ step }));
    } else {
      let advance = true;
      if (nextButtonConfig && nextButtonConfig.onClick) {
        console.log('line 114 ', nextButtonConfig);
        const newFormFields: FormConfigData = await nextButtonConfig.onClick({
          formFields,
          errHandler: setFormError,
          dispatch,
          formFieldsChanged: !!isEdited,
        });
        console.log('awaitsuccess', nextButtonConfig?.awaitSuccess);
        if (nextButtonConfig?.awaitSuccess) {
          console.log('await success');
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
          console.log('advance ', advance);
          if (!advance && nextButtonConfig?.awaitSuccess) {
            console.log('!advance && nextButtonConfig?.awaitSuccess ');
            nextButtonConfig.awaitSuccess?.onAwaitTimeout?.({
              formFields: newFormFields,
              errHandler: setFormError,
              dispatch,
              formFieldsChanged: !!isEdited,
            });
          }
        }
        if (advance && step) {
          console.log('advancing');
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

  const stepBody = (currentStep: FormWorkflowStep<FormConfigData>) => {
    if (currentStep) {
      const FormComponent: DynamicComponent = currentStep?.formComponent;
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
    console.log('awaitingasync ', awaitingAsyncAction);
  }, [awaitingAsyncAction]);

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
          if (step?.saveChanges) {
            await step?.saveChanges(formFields as FormConfigData, setFormError);
            onClickOut(true, SUBMIT_TOAST_MESSAGE);
          }
        }}
      />

      {formWorkflowConfig.steps && (
        <FullscreenModal
          title="New learning platform integration"
          isOpen={isStepperOpen}
          onClose={onCancel}
          className="stepper-modal"
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
};

export default FormWorkflow;
