import type { FormFieldValidation } from "../../../forms/FormContext";
import { BLACKBOARD_OAUTH_REDIRECT_URL, BLACKBOARD_TYPE, CANVAS_OAUTH_REDIRECT_URL, CANVAS_TYPE, INVALID_NAME } from "../../data/constants";
import handleErrors from "../../utils";
import { camelCaseDict } from "../../../../utils";
import { setWorkflowStateAction, updateFormFieldsAction } from "../../../forms/data/actions";
import { CanvasConfigCamelCase, CanvasConfigSnakeCase } from "./Canvas/CanvasConfig";
import { BlackboardConfigCamelCase, BlackboardConfigSnakeCase } from "./Blackboard/BlackboardConfig";
import { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from "./Cornerstone/CornerstoneConfig";
import { DegreedConfigCamelCase, DegreedConfigSnakeCase } from "./Degreed/DegreedConfig";
import { MoodleConfigCamelCase, MoodleConfigSnakeCase } from "./Moodle/MoodleConfig";
import { SAPConfigCamelCase, SAPConfigSnakeCase } from "./SAP/SAPConfig";
import { FormWorkflowErrorHandler, WAITING_FOR_ASYNC_OPERATION } from "../../../forms/FormWorkflow";

type ConfigCamelCase =
  BlackboardConfigCamelCase | CanvasConfigCamelCase | CornerstoneConfigCamelCase | DegreedConfigCamelCase | MoodleConfigCamelCase | SAPConfigCamelCase;
type ConfigSnakeCase =
  BlackboardConfigSnakeCase | CanvasConfigSnakeCase | CornerstoneConfigSnakeCase | DegreedConfigSnakeCase | MoodleConfigSnakeCase | SAPConfigSnakeCase;

export const LMS_AUTHORIZATION_FAILED = "LMS AUTHORIZATION FAILED";

export async function handleSubmitHelper(
  enterpriseCustomerUuid: string,
  transformedConfig: ConfigSnakeCase,
  existingData: any,
  onSubmit: Function,
  formFieldsChanged: Boolean,
  currentFormFields: any,
  lmsType: string,
  channelMap: { [key: string]: {[key: string]: any }},
  errHandler: FormWorkflowErrorHandler | undefined,
  dispatch: any,
) {
  transformedConfig.enterprise_customer = enterpriseCustomerUuid;

  let err = "";
  if (formFieldsChanged) {
    if (currentFormFields?.id) {
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
  if (err) {
    errHandler?.(err);
  }
  if ((lmsType === BLACKBOARD_TYPE || lmsType === CANVAS_TYPE) && currentFormFields && !currentFormFields?.refreshToken) {
    let oauthUrl: string;
    if (lmsType == BLACKBOARD_TYPE) {
      let appKey = existingData.clientId;
      let configUuid = existingData.uuid;
      if (!appKey || !configUuid) {
        try {
          if (lmsType === BLACKBOARD_TYPE) {
            const response = await channelMap[lmsType].fetchGlobal();
            appKey = response.data.results[response.data.results.length - 1].app_key;
            configUuid = response.data.uuid;
          }
          else { }
        } catch (error) {
          err = handleErrors(error);
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
  return currentFormFields;
}

export async function afterSubmitHelper(
  lmsType: string,
  formFields: any,
  channelMap: { [key: string]: {[key: string]: any }},
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

export async function onTimeoutHelper(
  dispatch: any) {
  dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false));
  dispatch?.(setWorkflowStateAction(LMS_AUTHORIZATION_FAILED, true));
}

export async function handleSaveHelper(
  transformedConfig: ConfigSnakeCase,
  existingData: any,
  formFields: ConfigCamelCase,
  onSubmit: Function,
  lmsType: string,
  channelMap: { [key: string]: {[key: string]: any }},
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

export function checkForDuplicateNames(existingConfigNames: string[], existingData: any): FormFieldValidation {
  const configNames: string[] = existingConfigNames?.filter((name) => name !== existingData.displayName);
  const displayNameValidation: FormFieldValidation = {
    formFieldId: 'displayName',
    validator: () => {
      return configNames?.includes('displayName')
        ? INVALID_NAME
        : false;
    },
  }
  return displayNameValidation;
}
