import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import { SUBMIT_TOAST_MESSAGE   } from "../../../data/constants";
// @ts-ignore
import DegreedConfigActivatePage from "./DegreedConfigActivatePage.tsx";
import DegreedConfigAuthorizePage, {
  validations,
  formFieldNames
  // @ts-ignore
} from "./DegreedConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
  FormWorkflowErrorHandler,
} from "../../../../forms/FormWorkflow";
// @ts-ignore
import { WAITING_FOR_ASYNC_OPERATION } from "../../../../forms/FormWorkflow.tsx";
import {
  setWorkflowStateAction,
  updateFormFieldsAction,
  // @ts-ignore
} from "../../../../forms/data/actions.ts";
import type {
  FormFieldValidation,
} from "../../../../forms/FormContext";

export type DegreedConfigCamelCase = {
  displayName: string;
  clientId: string;
  clientSecret: string;
  degreedBaseUrl: string;
  degreedFetchUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

// TODO: Can we generate this dynamically?
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export type DegreedConfigSnakeCase = {
  display_name: string;
  client_id: string;
  client_secret: string;
  degreed_base_url: string;
  degreed_fetch_url: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};

// TODO: Make this a generic type usable by all lms configs
export type DegreedFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: DegreedConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (degreedConfig: DegreedConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const DegreedFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: DegreedFormConfigProps): FormWorkflowConfig<DegreedConfigCamelCase> => {
  const configNames: string[] = existingConfigNames?.filter( (name) => name !== existingData.displayName);
  const checkForDuplicateNames: FormFieldValidation = {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (formFields: DegreedConfigCamelCase) => {
      return configNames?.includes(formFields.displayName)
        ? "Display name already taken"
        : false;
    },
  };

  const saveChanges = async (
    formFields: DegreedConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateDegreedConfig(
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
        await LmsApiService.postNewDegreedConfig(transformedConfig);
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
  }: FormWorkflowHandlerArgs<DegreedConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";
    if (formFieldsChanged) {
      if (currentFormFields?.id) {
        try {
          transformedConfig.active = existingData.active;
          const response = await LmsApiService.updateDegreedConfig(
            transformedConfig,
            existingData.id
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as DegreedConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      } else {
        try {
          transformedConfig.active = false;
          const response = await LmsApiService.postNewDegreedConfig(
            transformedConfig
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as DegreedConfigCamelCase;
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

  const steps: FormWorkflowStep<DegreedConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: DegreedConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<DegreedConfigCamelCase>;
      },
    },
    {
      index: 1,
      formComponent: DegreedConfigActivatePage,
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

export default DegreedFormConfig;
