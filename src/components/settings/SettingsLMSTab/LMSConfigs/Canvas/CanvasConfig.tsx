import type { Dispatch } from "react";

import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { camelCaseDict, snakeCaseDict } from "../../../../../utils";
import {
  CANVAS_OAUTH_REDIRECT_URL,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
  SUBMIT_TOAST_MESSAGE,
} from "../../../data/constants";
// @ts-ignore
import CanvasConfigActivatePage from "./CanvasConfigActivatePage.tsx";
import CanvasConfigAuthorizePage, {
  validations,
  // @ts-ignore
} from "./CanvasConfigAuthorizePage.tsx";
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

export type CanvasConfigCamelCase = {
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

// TODO: Can we generate this dynamically?
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export type CanvasConfigSnakeCase = {
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

// TODO: Make this a generic type usable by all lms configs
export type CanvasFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CanvasConfigCamelCase;
  onSubmit: (
    canvasConfig: CanvasConfigCamelCase,
    errHandler?: FormWorkflowErrorHandler
  ) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const LMS_AUTHORIZATION_FAILED = "LMS AUTHORIZATION FAILED";

export const CanvasFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
}: CanvasFormConfigProps): FormWorkflowConfig<CanvasConfigCamelCase> => {
  const saveChanges = async (
    formFields: CanvasConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateCanvasConfig(
          transformedConfig,
          existingData.id
        );
        onSubmit(formFields, errHandler);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      // TODO: Don't expose option if object not created yet
    }

    if (err) {
      errHandler(err);
    }
    return !err;
  };

  const handleSubmit = async ({
    formFields,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err = "";

    if (currentFormFields?.id) {
      try {
        transformedConfig.active = existingData.active;
        const response = await LmsApiService.updateCanvasConfig(
          transformedConfig,
          existingData.id
        );
        currentFormFields = camelCaseDict(
          response.data
        ) as CanvasConfigCamelCase;
        onSubmit(currentFormFields, errHandler);
        dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        const response = await LmsApiService.postNewCanvasConfig(
          transformedConfig
        );
        currentFormFields = camelCaseDict(
          response.data
        ) as CanvasConfigCamelCase;
        onSubmit(currentFormFields, errHandler);
        dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    }
    if (err) {
      errHandler?.(err);
    } else if (currentFormFields && !currentFormFields?.refreshToken) {
      const oauthUrl =
        `${currentFormFields.canvasBaseUrl}/login/oauth2/auth?client_id=${currentFormFields.clientId}&` +
        `state=${currentFormFields.uuid}&response_type=code&` +
        `redirect_uri=${CANVAS_OAUTH_REDIRECT_URL}`;

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
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    // Return immediately if already authorized
    if (formFields?.id) {
      let err = "";
      try {
        const response = await LmsApiService.fetchSingleCanvasConfig(
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
  }: FormWorkflowHandlerArgs<CanvasConfigCamelCase>) => {
    dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false));
    dispatch?.(setWorkflowStateAction(LMS_AUTHORIZATION_FAILED, true));
  };

  const steps: FormWorkflowStep<CanvasConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: CanvasConfigAuthorizePage,
      validations,
      stepName: "Authorize",
      saveChanges,
      nextButtonConfig: (formFields: CanvasConfigCamelCase) => {
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
        return config as FormWorkflowButtonConfig<CanvasConfigCamelCase>;
      },
    },
    {
      index: 1,
      formComponent: CanvasConfigActivatePage,
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

export default CanvasFormConfig;
