import { useState, useEffect } from 'react';
import _ from 'lodash';
import { snakeCaseDict } from "../../../../../utils";
import { 
  CANVAS_TYPE, LMS_CONFIG_OAUTH_POLLING_INTERVAL, LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
} from "../../../data/constants";
// @ts-ignore
import CanvasConfigAuthorizePage, { validations } from "./CanvasConfigAuthorizePage.tsx";
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import { activateConfig, afterSubmitHelper, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper, onTimeoutHelper } from "../utils.tsx";

export type CanvasConfigCamelCase = {
  lms: string;
  canvasAccountId: string;
  canvasBaseUrl: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  id: string;
  active: boolean;
  uuid: string;
  refreshToken: string;
};

export type CanvasConfigSnakeCase = {
  lms: string;
  canvas_account_id: string;
  canvas_base_url: string;
  display_name: string;
  client_id: string;
  client_secret: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};

export type CanvasFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CanvasConfigCamelCase;
  existingConfigNames: Map<string, string>;
  onSubmit: (canvasConfig: CanvasConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>,
};

export const CanvasFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap,
}: CanvasFormConfigProps): FormWorkflowConfig<CanvasConfigCamelCase> => {

  const saveChanges = async (
    formFields: CanvasConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, CANVAS_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged,
      currentFormFields, CANVAS_TYPE, channelMap, errHandler, dispatch);
  };

  const awaitAfterSubmit = async ({
    formFields,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    return afterSubmitHelper(CANVAS_TYPE, formFields, channelMap, errHandler, dispatch);
  };

  const onAwaitTimeout = async ({
    dispatch,
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    onTimeoutHelper(dispatch);
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, CANVAS_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(CANVAS_TYPE);

  const steps: FormWorkflowStep<CanvasConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: CanvasConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames)]),
      stepName: "Configure",
      saveChanges,
      nextButtonConfig: (formFields: CanvasConfigCamelCase) => {
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
        return config as FormWorkflowButtonConfig<CanvasConfigCamelCase>;
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
        return config as FormWorkflowButtonConfig<CanvasConfigCamelCase>;
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

export default CanvasFormConfig;
