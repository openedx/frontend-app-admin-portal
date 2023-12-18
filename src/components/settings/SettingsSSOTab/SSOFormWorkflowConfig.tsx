import omit from 'lodash/omit';

import { AxiosError } from 'axios';
import type { FormWorkflowHandlerArgs, FormWorkflowStep } from '../../forms/FormWorkflow';
import SSOConfigConnectStep, { validations as SSOConfigConnectStepValidations } from './steps/NewSSOConfigConnectStep';
import SSOConfigConfigureStep, { validations as SSOConfigConfigureStepValidations } from './steps/NewSSOConfigConfigureStep';
import SSOConfigAuthorizeStep, { validations as SSOConfigAuthorizeStepValidations } from './steps/NewSSOConfigAuthorizeStep';
import SSOConfigConfirmStep from './steps/NewSSOConfigConfirmStep';
import LmsApiService from '../../../data/services/LmsApiService';
import handleErrors from '../utils';
import { snakeCaseDict } from '../../../utils';
import { INVALID_IDP_METADATA_ERROR, RECORD_UNDER_CONFIGURATIONS_ERROR } from '../data/constants';

type SSOConfigSnakeCase = {
  uuid?: string,
  enterprise_customer: string,
  is_removed: boolean,
  active: boolean,
  identity_provider: string,
  metadata_url: string,
  metadata_xml: string,
  entity_id: string,
  update_from_metadata: boolean,
  user_id_attribute: string,
  full_name_attribute: string,
  last_name_attribute: string,
  email_attribute: string,
  username_attribute: string,
  country_attribute: string,
  submitted_at?: null,
  configured_at?: null,
  validated_at?: null,
  odata_api_timeout_interval: null,
  odata_api_root_url: string,
  odata_company_id: string,
  sapsf_oauth_root_url: string,
  odata_api_request_timeout: null,
  sapsf_private_key: string,
  odata_client_id: string,
  oauth_user_id: string,
  sp_metadata_url?: string,
  record?: object,
  marked_authorized: boolean
};

export type SSOConfigCamelCase = {
  uuid?: string,
  enterpriseCustomer: string,
  isRemoved: boolean,
  active: boolean,
  identityProvider: string,
  metadataUrl: string,
  metadataXml: string,
  entityId: string,
  updateFromMetadata: boolean,
  userIdAttribute: string,
  fullNameAttribute: string,
  firstNameAttribute: string,
  lastNameAttribute: string,
  emailAttribute: string,
  usernameAttribute: string,
  countryAttribute: string,
  submittedAt: null,
  configuredAt: null,
  validatedAt: null,
  odataApiTimeoutInterval: null,
  odataApiRootUrl: string,
  odataCompanyId: string,
  sapsfOauthRootUrl: string,
  odataApiRequestTimeout: null,
  sapsfPrivateKey: string,
  odataClientId: string,
  oauthUserId: string,
  spMetadataUrl?: string,
  markedAuthorized: boolean
};

type SSOConfigFormControlVariables = {
  idpConnectOption?: boolean,
  confirmAuthorizedEdxServiceProvider?: boolean
};

type SSOConfigFormContextData = SSOConfigCamelCase & SSOConfigFormControlVariables;

export const SSOFormWorkflowConfig = ({ enterpriseId, setConfigureError }) => {
  const advanceConnectStep = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<SSOConfigFormContextData>) => {
    errHandler?.('');
    return { ...formFields };
  };

  const sanitizeAndCopyFormFields = (formFields: SSOConfigSnakeCase) => {
    const copiedFormFields = { ...formFields };
    return omit(copiedFormFields, ['record', 'sp_metadata_url', 'submitted_at', 'configured_at', 'validated_at']);
  };

  const saveChanges = async ({
    formFields,
    errHandler,
    // @ts-ignore:next-line formFieldsChanged is only used in the below TODO
    formFieldsChanged,
  }: FormWorkflowHandlerArgs<SSOConfigFormContextData>) => {
    let err = null;

    // TODO : Accurately detect if form fields have changed
    // if (!formFieldsChanged && !idpMetadataError) {
    //   // Don't submit if nothing has changed
    //   return formFields;
    // }
    let updatedFormFields: SSOConfigCamelCase = omit(formFields, ['idpConnectOption', 'spMetadataUrl', 'isPendingConfiguration']);
    updatedFormFields.enterpriseCustomer = enterpriseId;
    const submittedFormFields: SSOConfigSnakeCase = snakeCaseDict(updatedFormFields) as SSOConfigSnakeCase;
    const copiedFormFields = sanitizeAndCopyFormFields(submittedFormFields);
    if (copiedFormFields?.uuid) {
      try {
        const updateResponse = await LmsApiService.updateEnterpriseSsoOrchestrationRecord(
          copiedFormFields,
          formFields?.uuid,
        );
        updatedFormFields = updateResponse.data;
      } catch (error: AxiosError | any) {
        err = handleErrors(error);
        if (error.message?.includes('Must provide valid IDP metadata url')) {
          errHandler?.(INVALID_IDP_METADATA_ERROR);
        } else if (error.message?.includes('Record has already been submitted for configuration.')) {
          errHandler?.(RECORD_UNDER_CONFIGURATIONS_ERROR);
        } else {
          setConfigureError(error);
        }
      }
    } else {
      try {
        const createResponse = await LmsApiService.createEnterpriseSsoOrchestrationRecord(copiedFormFields);
        updatedFormFields.uuid = createResponse.data.record;
        updatedFormFields.spMetadataUrl = createResponse.data.sp_metadata_url;
      } catch (error: AxiosError | any) {
        err = handleErrors(error);
        if (error.message?.includes('Must provide valid IDP metadata url')) {
          errHandler?.(INVALID_IDP_METADATA_ERROR);
        } else {
          setConfigureError(error);
        }
      }
    }

    const newFormFields = { ...formFields, ...updatedFormFields } as SSOConfigCamelCase;
    return newFormFields;
  };

  const steps: FormWorkflowStep<SSOConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: SSOConfigConnectStep,
      validations: SSOConfigConnectStepValidations,
      stepName: 'Connect',
      nextButtonConfig: () => ({
        buttonText: 'Next',
        opensNewWindow: false,
        onClick: advanceConnectStep,
        preventDefaultErrorModal: true,
      }),
    }, {
      index: 1,
      formComponent: SSOConfigConfigureStep,
      validations: SSOConfigConfigureStepValidations,
      stepName: 'Configure',
      nextButtonConfig: () => ({
        buttonText: 'Configure',
        opensNewWindow: false,
        onClick: saveChanges,
        preventDefaultErrorModal: true,
      }),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 2,
      formComponent: SSOConfigAuthorizeStep,
      validations: SSOConfigAuthorizeStepValidations,
      stepName: 'Authorize',
      nextButtonConfig: () => ({
        buttonText: 'Next',
        opensNewWindow: false,
        onClick: saveChanges,
        preventDefaultErrorModal: false,
      }),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 3,
      formComponent: SSOConfigConfirmStep,
      validations: [],
      stepName: 'Confirm and Test',
      nextButtonConfig: () => ({
        buttonText: 'Finish',
        opensNewWindow: false,
        onClick: () => {},
        preventDefaultErrorModal: false,
      }),
      showBackButton: true,
      showCancelButton: false,
    },
  ];

  // Start at the first step
  const getCurrentStep = () => steps[0];

  return {
    getCurrentStep,
    steps,
  };
};

export default SSOFormWorkflowConfig;
