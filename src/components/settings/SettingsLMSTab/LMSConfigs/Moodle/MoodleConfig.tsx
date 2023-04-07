import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import { MOODLE_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";

import MoodleConfigEnablePage, {
  validations,
  formFieldNames
  // @ts-ignore
} from "./MoodleConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
} from "../../../../forms/FormWorkflow";
import {
  updateFormFieldsAction,
  // @ts-ignore
} from "../../../../forms/data/actions.ts";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";
import { checkForDuplicateNames } from "../utils";

export type MoodleConfigCamelCase = {
  displayName: string;
  moodleBaseUrl: string;
  webserviceShortName: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type MoodleConfigSnakeCase = {
  display_name: string;
  moodle_base_url: string;
  webservice_short_name: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type MoodleFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: MoodleConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (moodleConfig: MoodleConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const MoodleFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: MoodleFormConfigProps): FormWorkflowConfig<MoodleConfigCamelCase> => {

  const saveChanges = async (
    formFields: MoodleConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: MoodleConfigSnakeCase = snakeCaseDict(
      formFields
    ) as MoodleConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateMoodleConfig(
          transformedConfig,
          existingData.id
        );
        onSubmit(formFields);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewMoodleConfig(transformedConfig);
        onSubmit(formFields);
      } catch (error) {
        err = handleErrors(error);
      }
    }

    if (err) {
      errHandler(err);
    }
    return !err;
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<MoodleConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: MoodleConfigSnakeCase = snakeCaseDict(
      formFields
    ) as MoodleConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";
    if (formFieldsChanged) {
      if (currentFormFields?.id) {
        try {
          transformedConfig.active = existingData.active;
          const response = await LmsApiService.updateMoodleConfig(
            transformedConfig,
            existingData.id
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as MoodleConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      } else {
        try {
          transformedConfig.active = false;
          const response = await LmsApiService.postNewMoodleConfig(
            transformedConfig
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as MoodleConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      }
    }
    if (err) {
      errHandler?.(err);
    }
    return currentFormFields;
  };

  const activatePage = () => ConfigActivatePage(MOODLE_TYPE);

  const steps: FormWorkflowStep<MoodleConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: MoodleConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<MoodleConfigCamelCase>;
      },
    },
    {
      index: 1,
      formComponent: activatePage,
      validations: [],
      stepName: "Activate",
      saveChanges,
      nextButtonConfig: () => ({
        buttonText: "Activate",
        opensNewWindow: false,
        onClick: () => {
          onClickCancel(true, SUBMIT_TOAST_MESSAGE);
          return Promise.resolve(existingData);
        },
      }),
    },
  ];

  // Go to authorize step for now
  const getCurrentStep = () => steps[0];

  return {
    getCurrentStep,
    steps,
  };
};

export default MoodleFormConfig;
