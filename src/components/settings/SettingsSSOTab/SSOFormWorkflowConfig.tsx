import omit from 'lodash/omit';

import type { FormWorkflowHandlerArgs, FormWorkflowStep } from '../../forms/FormWorkflow';
import SSOConfigConnectStep, { validations as SSOConfigConnectStepValidations } from './steps/NewSSOConfigConnectStep';
import SSOConfigConfigureStep, { validations as SSOConfigConfigureStepValidations } from './steps/NewSSOConfigConfigureStep';
import SSOConfigAuthorizeStep, { validations as SSOConfigAuthorizeStepValidations } from './steps/NewSSOConfigAuthorizeStep';
import SSOConfigConfirmStep from './steps/NewSSOConfigConfirmStep';
import LmsApiService from '../../../data/services/LmsApiService';
import handleErrors from '../utils';
import { snakeCaseDict } from '../../../utils';

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
  submitted_at: null,
  configured_at: null,
  validated_at: null,
  odata_api_timeout_interval: null,
  odata_api_root_url: string,
  odata_company_id: string,
  sapsf_oauth_root_url: string,
  odata_api_request_timeout: null,
  sapsf_private_key: string,
  odata_client_id: string,
  oauth_user_id: string,
  sp_metadata_url?: string
};

type SSOConfigCamelCase = {
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
  spMetadataUrl?: string
};

type SSOConfigFormControlVariables = {
  idpConnectOption?: boolean,
  confirmAuthorizedEdxServiceProvider?: boolean
};

type SSOConfigFormContextData = SSOConfigCamelCase & SSOConfigFormControlVariables;

export const SSOFormWorkflowConfig = ({ enterpriseId }) => {
  const placeHolderButton = (buttonName?: string) => () => ({
    buttonText: buttonName || 'Next',
    opensNewWindow: false,
    onClick: () => {},
  });

  const saveChanges = async ({
    formFields,
    errHandler,
    formFieldsChanged,
  }:FormWorkflowHandlerArgs<SSOConfigFormContextData>) => {
    let err = null;
    if (!formFieldsChanged) {
      // Don't submit if nothing has changed
      return formFields;
    }
    let updatedFormFields: SSOConfigCamelCase = omit(formFields, ['idpConnectOption', 'spMetadataUrl', 'isPendingConfiguration']);
    updatedFormFields.enterpriseCustomer = enterpriseId;
    const submittedFormFields: SSOConfigSnakeCase = snakeCaseDict(updatedFormFields) as SSOConfigSnakeCase;
    if (submittedFormFields?.uuid) {
      try {
        const updateResponse = await LmsApiService.updateEnterpriseSsoOrchestrationRecord(
          submittedFormFields,
          formFields?.uuid,
        );
        updatedFormFields = updateResponse.data;
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        const createResponse = await LmsApiService.createEnterpriseSsoOrchestrationRecord(submittedFormFields);
        updatedFormFields.uuid = createResponse.data.record;
        updatedFormFields.spMetadataUrl = createResponse.data.sp_metadata_url;
      } catch (error) {
        err = handleErrors(error);
      }
    }
    if (err && errHandler) {
      errHandler(err);
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
      nextButtonConfig: placeHolderButton(),
    }, {
      index: 1,
      formComponent: SSOConfigConfigureStep,
      validations: SSOConfigConfigureStepValidations,
      stepName: 'Configure',
      nextButtonConfig: () => ({
        buttonText: 'Configure',
        opensNewWindow: false,
        onClick: saveChanges,
      }),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 2,
      formComponent: SSOConfigAuthorizeStep,
      validations: SSOConfigAuthorizeStepValidations,
      stepName: 'Authorize',
      nextButtonConfig: placeHolderButton(),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 3,
      formComponent: SSOConfigConfirmStep,
      validations: [],
      stepName: 'Confirm and Test',
      nextButtonConfig: placeHolderButton('Finish'),
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
