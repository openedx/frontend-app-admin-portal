import { snakeCaseDict } from "../../../../../utils";
import {
  BLACKBOARD_TYPE,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
  SUBMIT_TOAST_MESSAGE,
} from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import BlackboardConfigAuthorizePage, { validations } from "./BlackboardConfigAuthorizePage.tsx";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
} from "../../../../forms/FormWorkflow";
import { afterSubmitHelper, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper, onTimeoutHelper } from "../utils";

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
  channelMap: { [key: string]: {[key: string]: any }},
};

export const BlackboardFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
  channelMap,
}: BlackboardFormConfigProps): FormWorkflowConfig<BlackboardConfigCamelCase> => {

  const saveChanges = async (
    formFields: BlackboardConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: BlackboardConfigSnakeCase = snakeCaseDict(
      formFields
    ) as BlackboardConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, BLACKBOARD_TYPE, channelMap, errHandler);
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
    return handleSubmitHelper(enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged, currentFormFields, BLACKBOARD_TYPE, channelMap, errHandler, dispatch)
  };

  const awaitAfterSubmit = async ({
    formFields,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    return afterSubmitHelper(BLACKBOARD_TYPE, formFields, channelMap, errHandler, dispatch);
  };

  const onAwaitTimeout = async ({
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    onTimeoutHelper(dispatch);
  };

  const activatePage = () => ConfigActivatePage(BLACKBOARD_TYPE);

  const steps: FormWorkflowStep<BlackboardConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: BlackboardConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
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
