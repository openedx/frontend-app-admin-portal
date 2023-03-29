import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import {
  BLACKBOARD_OAUTH_REDIRECT_URL,
  BLACKBOARD_TYPE,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
  SUBMIT_TOAST_MESSAGE,
} from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage";
import BlackboardConfigAuthorizePage, {
  validations,
  formFieldNames
  // @ts-ignore
} from "./BlackboardConfigAuthorizePage.tsx";
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

export type BlackboardConfigCamelCase = {
  blackboardAccountId: string;
  blackboardBaseUrl: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  id: string;
  active: boolean;
  uuid: string;
  refreshToken: string;
};

export type BlackboardConfigSnakeCase = {
  blackboard_base_url: string;
  display_name: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};

export type BlackboardFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: BlackboardConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (blackboardConfig: BlackboardConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const LMS_AUTHORIZATION_FAILED = "LMS AUTHORIZATION FAILED";

export const BlackboardFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: BlackboardFormConfigProps): FormWorkflowConfig<BlackboardConfigCamelCase> => {
  const configNames: string[] = existingConfigNames?.filter( (name) => name !== existingData.displayName);
  const checkForDuplicateNames: FormFieldValidation = {
    formFieldId: formFieldNames.DISPLAY_NAME,
    validator: (formFields: BlackboardConfigCamelCase) => {
      return configNames?.includes(formFields.displayName)
        ? "Display name already taken"
        : false;
    },
  };

  const saveChanges = async (
    formFields: BlackboardConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: BlackboardConfigSnakeCase = snakeCaseDict(
      formFields
    ) as BlackboardConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateBlackboardConfig(
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
        await LmsApiService.postNewBlackboardConfig(transformedConfig);
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
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: BlackboardConfigSnakeCase = snakeCaseDict(
      formFields
    ) as BlackboardConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";
    if (formFieldsChanged) {
      if (currentFormFields?.id) {
        try {
          transformedConfig.active = existingData.active;
          const response = await LmsApiService.updateBlackboardConfig(
            transformedConfig,
            existingData.id
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as BlackboardConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      } else {
        try {
          transformedConfig.active = false;
          const response = await LmsApiService.postNewBlackboardConfig(
            transformedConfig
          );
          currentFormFields = camelCaseDict(
            response.data
          ) as BlackboardConfigCamelCase;
          onSubmit(currentFormFields);
          dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
        } catch (error) {
          err = handleErrors(error);
        }
      }
    }
    if (err) {
      errHandler?.(err);
    } else if (currentFormFields && !currentFormFields?.refreshToken) {
      let appKey = existingData.clientId;
      let configUuid = existingData.uuid;
      if (!appKey || !configUuid) {
        try {
          const response = await LmsApiService.fetchBlackboardGlobalConfig();
          appKey = response.data.results[response.data.results.length - 1].app_key;
          configUuid = response.data.uuid;
        } catch (error) {
          err = handleErrors(error);
        }
      }
      const oauthUrl = `${currentFormFields.blackboardBaseUrl}/learn/api/public/v1/oauth2/authorizationcode?`
        + `redirect_uri=${BLACKBOARD_OAUTH_REDIRECT_URL}&scope=read%20write%20delete%20offline&`
        + `response_type=code&client_id=${appKey}&state=${configUuid}`;
      window.open(oauthUrl);

      // Open the oauth window for the user
      window.open(oauthUrl);
      dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, true));
    }
    return currentFormFields;
  };

  const awaitAfterSubmit = async ({
    formFields,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    if (formFields?.id) {
      let err = "";
      try {
        const response = await LmsApiService.fetchSingleBlackboardConfig(
          formFields.id
        );
        if (response.data.refresh_token) {
          dispatch?.(
            setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false)
          );
          return true;
        }
      } catch (error) {
        err = handleErrors(error);
      }
      if (err) {
        errHandler?.(err);
        return false;
      }
    }

    return false;
  };

  const onAwaitTimeout = async ({
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false));
    dispatch?.(setWorkflowStateAction(LMS_AUTHORIZATION_FAILED, true));
  };

  const activatePage = () => ConfigActivatePage(BLACKBOARD_TYPE);

  const steps: FormWorkflowStep<BlackboardConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: BlackboardConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames]),
      stepName: "Authorize",
      saveChanges,
      nextButtonConfig: (formFields: BlackboardConfigCamelCase) => {
        let config = {
          buttonText: "Authorize",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        if (!formFields.refreshToken) {
          config = {
            ...config,
            ...{
              opensNewWindow: true,
              awaitSuccess: {
                awaitCondition: awaitAfterSubmit,
                awaitInterval: LMS_CONFIG_OAUTH_POLLING_INTERVAL,
                awaitTimeout: LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
                onAwaitTimeout: onAwaitTimeout,
              },
            },
          };
        }
        return config as FormWorkflowButtonConfig<BlackboardConfigCamelCase>;
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

export default BlackboardFormConfig;
