import { useEffect } from "react";
import _ from 'lodash';
import { snakeCaseDict } from "../../../../../utils";
import {
  BLACKBOARD_TYPE,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
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
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import { activateConfig, afterSubmitHelper, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper, onTimeoutHelper } from "../utils.tsx";

export type BlackboardConfigCamelCase = {
  lms: string;
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
  lms: string;
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
  existingConfigNames: Map<string, string>;
  onSubmit: (blackboardConfig: BlackboardConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>,
};

export const BlackboardFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
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
    return handleSubmitHelper(
      enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged,
      currentFormFields, BLACKBOARD_TYPE, channelMap, errHandler, dispatch);
  };

  const awaitAfterSubmit = async ({
    formFields,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    const response = await afterSubmitHelper(BLACKBOARD_TYPE, formFields, channelMap, errHandler, dispatch);
    return response;
  };

  const onAwaitTimeout = async ({
    dispatch,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    onTimeoutHelper(dispatch);
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<BlackboardConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, BLACKBOARD_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(BLACKBOARD_TYPE);


  const steps: FormWorkflowStep<BlackboardConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: BlackboardConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames)]),
      stepName: "Authorize",
      saveChanges,
      nextButtonConfig: (formFields: BlackboardConfigCamelCase) => {
        let config = {
          buttonText: "Authorize",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        // if they've never authorized it or if they've changed the form
        if (!formFields.refreshToken || !_.isEqual(existingData, formFields)) {
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
      index: 2,
      formComponent: activatePage,
      validations: [],
      stepName: "Activate",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Activate",
          opensNewWindow: false,
          onClick: activate,
        };
        return config as FormWorkflowButtonConfig<BlackboardConfigCamelCase>;
      }
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
