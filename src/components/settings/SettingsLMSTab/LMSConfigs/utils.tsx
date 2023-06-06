import type { FormFieldValidation } from '../../../forms/FormContext';
import {
  BLACKBOARD_OAUTH_REDIRECT_URL, BLACKBOARD_TYPE, CANVAS_OAUTH_REDIRECT_URL,
  CANVAS_TYPE, INVALID_NAME, SUBMIT_TOAST_MESSAGE,
} from '../../data/constants';
import handleErrors from '../../utils';
import { camelCaseDict } from '../../../../utils';
import { setWorkflowStateAction, updateFormFieldsAction } from '../../../forms/data/actions';
import { CanvasConfigCamelCase, CanvasConfigSnakeCase } from './Canvas/CanvasTypes';
import { BlackboardConfigCamelCase, BlackboardConfigSnakeCase } from './Blackboard/BlackboardTypes';
import { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from './Cornerstone/CornerstoneTypes';
import { DegreedConfigCamelCase, DegreedConfigSnakeCase } from './Degreed/DegreedTypes';
import { MoodleConfigCamelCase, MoodleConfigSnakeCase } from './Moodle/MoodleTypes';
import { SAPConfigCamelCase, SAPConfigSnakeCase } from './SAP/SAPTypes';
import { FormWorkflowErrorHandler, WAITING_FOR_ASYNC_OPERATION } from '../../../forms/FormWorkflow';

type ConfigCamelCase = { id?: string, active?: boolean, lms?: string, } |
BlackboardConfigCamelCase | CanvasConfigCamelCase | CornerstoneConfigCamelCase |
DegreedConfigCamelCase | MoodleConfigCamelCase | SAPConfigCamelCase;

type ConfigSnakeCase = { enterprise_customer?: string, active?: boolean } |
BlackboardConfigSnakeCase | CanvasConfigSnakeCase | CornerstoneConfigSnakeCase |
DegreedConfigSnakeCase | MoodleConfigSnakeCase | SAPConfigSnakeCase;

export const LMS_AUTHORIZATION_FAILED = 'LMS AUTHORIZATION FAILED';

async function handleSubmitAuthorize(
  lmsType: string,
  existingData: any,
  currentFormFields: any,
  channelMap: Record<string, Record<string, any>>,
  dispatch: any,
) {
  if ((lmsType === BLACKBOARD_TYPE || lmsType === CANVAS_TYPE)
  && currentFormFields && !currentFormFields?.refreshToken) {
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
    } else {
      oauthUrl = `${currentFormFields.canvasBaseUrl}/login/oauth2/auth?client_id=${currentFormFields.clientId}&`
        + `state=${currentFormFields.uuid}&response_type=code&`
        + `redirect_uri=${CANVAS_OAUTH_REDIRECT_URL}`;
    }
    // Open the oauth window for the user
    window.open(oauthUrl);
    dispatch?.(setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, true));
  }
  return null;
}

export async function handleSubmitHelper(
  enterpriseCustomerUuid: string,
  transformedConfig: ConfigSnakeCase,
  existingData: ConfigCamelCase,
  onSubmit: (param: ConfigCamelCase) => void,
  formFieldsChanged: Boolean,
  currentFormFields: any,
  lmsType: string,
  channelMap: Record<string, Record<string, any>>,
  dispatch: any,
  errHandler?: FormWorkflowErrorHandler,
) {
  const config = transformedConfig;
  let formFields = currentFormFields;
  config.enterprise_customer = enterpriseCustomerUuid;
  let err = '';
  if (formFieldsChanged) {
    if (formFields?.id) { // id only exists on existing configs
      try {
        config.active = existingData.active;
        const response = await channelMap[lmsType].update(config, existingData.id);
        formFields = camelCaseDict(
          response.data,
        ) as ConfigCamelCase;
        onSubmit(formFields);
        dispatch?.(updateFormFieldsAction({ formFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        config.active = false;
        const response = await channelMap[lmsType].post(config);
        formFields = camelCaseDict(
          response.data,
        ) as ConfigCamelCase;
        onSubmit(formFields);
        dispatch?.(updateFormFieldsAction({ formFields }));
      } catch (error) {
        err = handleErrors(error);
      }
    }
  }
  const authorizeError = await handleSubmitAuthorize(lmsType, existingData, formFields, channelMap, dispatch);
  if (err) { errHandler?.(err); }
  if (authorizeError) { errHandler?.(authorizeError); }
  return formFields;
}

export async function afterSubmitHelper(
  lmsType: string,
  formFields: any,
  channelMap: Record<string, Record<string, any>>,
  dispatch: any,
  errHandler?: FormWorkflowErrorHandler,
) {
  if (formFields?.id) {
    let err = '';
    try {
      const response = await channelMap[lmsType].fetch(formFields.id);
      if (response.data.refresh_token) {
        dispatch?.(
          setWorkflowStateAction(WAITING_FOR_ASYNC_OPERATION, false),
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
  errHandler: (errMsg: string) => void,
) {
  let err = '';
  const config = transformedConfig;
  if (formFields.id) {
    try {
      config.active = existingData.active;
      await channelMap[lmsType].update(config, existingData.id);
      onSubmit(formFields);
    } catch (error) {
      err = handleErrors(error);
    }
  } else {
    try {
      config.active = false;
      await channelMap[lmsType].post(config);
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
      validName = !(existingConfigNames?.has(fields.displayName));
      if (fields.id && !validName) { // if we're editing an existing config
        if (existingConfigNames.get(fields.displayName) === fields.id) {
          validName = true;
        }
      }
      return validName ? false : INVALID_NAME;
    },
  };
}

export async function activateConfig(
  enterpriseCustomerUuid: string,
  channelMap: Record<string, Record<string, any>>,
  lmsType: string,
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>,
  id?: string,
  errHandler?: FormWorkflowErrorHandler,
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
