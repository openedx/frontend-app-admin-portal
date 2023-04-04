import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import { INVALID_NAME, SAP_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
import SAPConfigEnablePage, {
  validations,
  formFieldNames
  // @ts-ignore
} from "./SAPConfigEnablePage.tsx";
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

export type SAPConfigCamelCase = {
  displayName: string;
  sapBaseUrl: string;
  sapCompanyId: string;
  sapUserId: string;
  oauthClientId: string;
  oauthClientSecret: string;
  sapUserType: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type SAPConfigSnakeCase = {
  display_name: string;
  sap_base_url: string;
  sap_company_id: string;
  sap_user_id: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  sap_user_type: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type SAPFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: SAPConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (sapConfig: SAPConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const SAPFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: SAPFormConfigProps): FormWorkflowConfig<SAPConfigCamelCase> => {
  const configNames: string[] = existingConfigNames?.filter( (name) => name !== existingData.displayName);
  const checkForDuplicateNames: FormFieldValidation = {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (formFields: SAPConfigCamelCase) => {
      return configNames?.includes(formFields.displayName)
        ? INVALID_NAME
        : false;
    },
  };

  const saveChanges = async (
    formFields: SAPConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateSuccessFactorsConfig(
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
        await LmsApiService.postNewSuccessFactorsConfig(transformedConfig);
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
  }: FormWorkflowHandlerArgs<SAPConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";
    if (formFieldsChanged) {
      if (currentFormFields?.id) {
        try {
          transformedConfig.active = existingData.active;
          const response = await LmsApiService.updateSuccessFactorsConfig(
            transformedConfig,
            existingData.id
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as SAPConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      } else {
        try {
          transformedConfig.active = false;
          const response = await LmsApiService.postNewSuccessFactorsConfig(
            transformedConfig
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as SAPConfigCamelCase;
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

  const activatePage = () => ConfigActivatePage(SAP_TYPE);

  const steps: FormWorkflowStep<SAPConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: SAPConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<SAPConfigCamelCase>;
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

export default SAPFormConfig;
