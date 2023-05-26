import type { FormFieldValidation } from "../../../forms/FormContext";
import {
  BLACKBOARD_OAUTH_REDIRECT_URL, BLACKBOARD_TYPE, CANVAS_OAUTH_REDIRECT_URL, CANVAS_TYPE, INVALID_NAME, SUBMIT_TOAST_MESSAGE
} from "../../data/constants";
import handleErrors from "../../utils";
import { camelCaseDict } from "../../../../utils";
// @ts-ignore
import { setWorkflowStateAction, updateFormFieldsAction } from "../../../forms/data/actions.ts";
import { CanvasConfigCamelCase, CanvasConfigSnakeCase } from "./Canvas/CanvasConfig";
import { BlackboardConfigCamelCase, BlackboardConfigSnakeCase } from "./Blackboard/BlackboardConfig";
import { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from "./Cornerstone/CornerstoneConfig";
import { DegreedConfigCamelCase, DegreedConfigSnakeCase } from "./Degreed/DegreedConfig";
import { MoodleConfigCamelCase, MoodleConfigSnakeCase } from "./Moodle/MoodleConfig";
import { SAPConfigCamelCase, SAPConfigSnakeCase } from "./SAP/SAPConfig";
// @ts-ignore
import { FormWorkflowErrorHandler, WAITING_FOR_ASYNC_OPERATION } from "../../../forms/FormWorkflow.tsx";
import LmsApiService from "../../../../data/services/LmsApiService";

type ConfigCamelCase = { id?: string, active?: boolean, lms?: string, } |
  BlackboardConfigCamelCase | CanvasConfigCamelCase | CornerstoneConfigCamelCase | DegreedConfigCamelCase | MoodleConfigCamelCase | SAPConfigCamelCase;
type ConfigSnakeCase = { enterprise_customer?: string, active?: boolean } |
  BlackboardConfigSnakeCase | CanvasConfigSnakeCase | CornerstoneConfigSnakeCase | DegreedConfigSnakeCase | MoodleConfigSnakeCase | SAPConfigSnakeCase;

export const LMS_AUTHORIZATION_FAILED = "LMS AUTHORIZATION FAILED";

export async function handleSubmitHelper(
  enterpriseCustomerUuid: string,
  transformedConfig: ConfigSnakeCase,
  existingData: ConfigCamelCase,
  onSubmit: (param: ConfigCamelCase) => void,
  formFieldsChanged: Boolean,
  currentFormFields: any,
  lmsType: string,
  channelMap: Record<string, Record<string, any>>,
  errHandler: FormWorkflowErrorHandler | undefined,
  dispatch: any,
) {
  transformedConfig.enterprise_customer = enterpriseCustomerUuid;
  let err = "";
  if (formFieldsChanged) {
    if (currentFormFields?.id) { // id only exists on existing configs
      try {
        transformedConfig.active = existingData.active;
        const response = await channelMap[lmsType].update(transformedConfig, existingData.id)
        currentFormFields = camelCaseDict(
          response.data
        ) as ConfigCamelCase;
        onSubmit(currentFormFields);
        dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        const response = await channelMap[lmsType].post(transformedConfig)
        currentFormFields = camelCaseDict(
          response.data
        ) as ConfigCamelCase;
        onSubmit(currentFormFields);
        dispatch?.(updateFormFieldsAction({ formFields: currentFormFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    }
  }
  const authorizeError = await handleSubmitAuthorize(lmsType, existingData, currentFormFields, channelMap, dispatch);
  if (err) { errHandler?.(err); }
  if (authorizeError) { errHandler?.(authorizeError); }

  return currentFormFields;
}

async function handleSubmitAuthorize(
  lmsType: string,
  existingData: any,
  currentFormFields: any,
  channelMap: Record<string, Record<string, any>>,
  dispatch: any,
) {
  if ((lmsType === BLACKBOARD_TYPE || lmsType === CANVAS_TYPE) && currentFormFields && !currentFormFields?.refreshToken) {
    let oauthUrl: string;
    if (lmsType === BLACKBOARD_TYPE) {
      let appKey = existingData.clientId;
      let configUuid = existingData.uuid;
      if (!appKey || !configUuid) {
        try {
          if (lmsType === BLACKBOARD_TYPE) {
            const response = await channelMap[lmsType].fetchGlobal();
            appKey = response.data.results.at(-1).app_key;
            configUuid = response.data.uuid;
          }
        } catch (error) {
          return handleErrors(error);
        }
      }
      oauthUrl = `${currentFormFields.blackboardBaseUrl}/learn/api/public/v1/oauth2/authorizationcode?`
        + `redirect_uri=${BLACKBOARD_OAUTH_REDIRECT_URL}&scope=read%20write%20delete%20offline&`
        + `response_type=code&client_id=${appKey}&state=${configUuid}`;
    }
    else {
      oauthUrl =
        `${currentFormFields.canvasBaseUrl}/login/oauth2/auth?client_id=${currentFormFields.clientId}&` +
        `state=${currentFormFields.uuid}&response_type=code&` +
        `redirect_uri=${CANVAS_OAUTH_REDIRECT_URL}`;
    }
    // Open the oauth window for the user	
    window.open(oauthUrl);
    dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, true));
  }
  return null;
}

export async function afterSubmitHelper(
  lmsType: string,
  formFields: any,
  channelMap: Record<string, Record<string, any>>,
  errHandler: FormWorkflowErrorHandler | undefined,
  dispatch: any) {
  if (formFields?.id) {
    let err = "";
    try {
      const response = await channelMap[lmsType].fetch(formFields.id);
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
}

export async function onTimeoutHelper(dispatch: any) {
  dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false));
  dispatch?.(setWorkflowStateAction(LMS_AUTHORIZATION_FAILED, true));
}

export async function handleSaveHelper(
  transformedConfig: ConfigSnakeCase,
  existingData: ConfigCamelCase,
  formFields: ConfigCamelCase,
  onSubmit: (param: ConfigCamelCase) => void,
  lmsType: string,
  channelMap: Record<string, Record<string, any>>,
  errHandler: (errMsg: string) => void) {
  let err = "";
  if (formFields.id) {
    try {
      transformedConfig.active = existingData.active;
      await channelMap[lmsType].update(transformedConfig, existingData.id);
      onSubmit(formFields);
    } catch (error) {
      err = handleErrors(error);
    }
  } else {
    try {
      transformedConfig.active = false;
      await channelMap[lmsType].post(transformedConfig);
      onSubmit(formFields);
    } catch (error) {
      err = handleErrors(error);
    }
  }
  if (err) {
    errHandler(err);
  }
  return !err;
}

export function checkForDuplicateNames(existingConfigNames: Map<string, string>): FormFieldValidation {
    return {
    formFieldId: 'displayName',
    validator: (fields) => {
      let validName = true;
      validName = !(existingConfigNames?.has(fields['displayName']));
      if (fields.id && !validName) { // if we're editing an existing config
        if (existingConfigNames.get(fields['displayName']) == fields.id) {
          validName = true;
        }
      }
      return validName ? '' : INVALID_NAME;
    },
  };
}

export async function activateConfig(
  enterpriseCustomerUuid: string,
  channelMap: Record<string, Record<string, any>>,
  lmsType: string,
  id: string | undefined,
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>,
  errHandler: FormWorkflowErrorHandler | undefined,
) {
  const configOptions = {
    active: true,
    enterprise_customer: enterpriseCustomerUuid,
  };
  let err;
  try {
    await channelMap[lmsType].update(configOptions, id);
  } catch (error) {
    err = handleErrors(error);
  }
  if (err) {
    errHandler?.(err);
  } else {
    handleCloseClick(true, SUBMIT_TOAST_MESSAGE);
  }
  if (err) {
    errHandler?.(err);
  }
}
