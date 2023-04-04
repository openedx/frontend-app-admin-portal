import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import { CORNERSTONE_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
import CornerstoneConfigEnablePage, {
  validations,
  formFieldNames
  // @ts-ignore
} from "./CornerstoneConfigEnablePage.tsx";
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

export type CornerstoneConfigCamelCase = {
  displayName: string;
  cornerstoneBaseUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type CornerstoneConfigSnakeCase = {
  display_name: string;
  cornerstone_base_url: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type CornerstoneFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CornerstoneConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (cornerstoneConfig: CornerstoneConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const CornerstoneFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: CornerstoneFormConfigProps): FormWorkflowConfig<CornerstoneConfigCamelCase> => {
  const configNames: string[] = existingConfigNames?.filter( (name) => name !== existingData.displayName);
  const checkForDuplicateNames: FormFieldValidation = {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (formFields: CornerstoneConfigCamelCase) => {
      return configNames?.includes(formFields.displayName)
        ? "Display name already taken"
        : false;
    },
  };

  const saveChanges = async (
    formFields: CornerstoneConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CornerstoneConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateCornerstoneConfig(
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
        await LmsApiService.postNewCornerstoneConfig(transformedConfig);
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
  }: FormWorkflowHandlerArgs<CornerstoneConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CornerstoneConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";
    if (formFieldsChanged) {
      if (currentFormFields?.id) {
        try {
          transformedConfig.active = existingData.active;
          const response = await LmsApiService.updateCornerstoneConfig(
            transformedConfig,
            existingData.id
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as CornerstoneConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      } else {
        try {
          transformedConfig.active = false;
          const response = await LmsApiService.postNewCornerstoneConfig(
            transformedConfig
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as CornerstoneConfigCamelCase;
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

  const activatePage = () => ConfigActivatePage(CORNERSTONE_TYPE);

  const steps: FormWorkflowStep<CornerstoneConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: CornerstoneConfigEnablePage, 
      validations: validations.concat([checkForDuplicateNames]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<CornerstoneConfigCamelCase>;
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

export default CornerstoneFormConfig;
