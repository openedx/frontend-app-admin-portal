import omit from 'lodash/omit';

// eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-unused-vars
import { AxiosError } from 'axios';
import type { FormWorkflowHandlerArgs, FormWorkflowStep } from '../../forms/FormWorkflow';
import SSOConfigConnectStep, { getValidations as getSSOConfigConnectStepValidations } from './steps/NewSSOConfigConnectStep';
import SSOConfigConfigureStep, { getValidations as getSSOConfigConfigureStepValidations } from './steps/NewSSOConfigConfigureStep';
import SSOConfigAuthorizeStep, { getValidations as getSSOConfigAuthorizeStepValidations } from './steps/NewSSOConfigAuthorizeStep';
import SSOConfigConfirmStep from './steps/NewSSOConfigConfirmStep';
import LmsApiService from '../../../data/services/LmsApiService';
import handleErrors from '../utils';
import { snakeCaseDict } from '../../../utils';
import { INVALID_IDP_METADATA_ERROR, RECORD_UNDER_CONFIGURATIONS_ERROR } from '../data/constants';
import { resetFormEditState } from '../../forms/data/actions';

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
  erroredAt: null,
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

export const SSOFormWorkflowConfig = ({ enterpriseId, setConfigureError, intl }) => {
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
    formFieldsChanged,
    dispatch,
  }: FormWorkflowHandlerArgs<SSOConfigFormContextData>) => {
    // Accurately detect if form fields have changed or there's and error in existing record
    let isErrored;
    if (formFields?.uuid) {
      isErrored = formFields.erroredAt
          && formFields.submittedAt
          && formFields.submittedAt < formFields.erroredAt;
    }
    if (!isErrored && !formFieldsChanged) {
      return formFields;
    }
    // else, update enterprise SSO record
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
        dispatch?.(resetFormEditState());
      } catch (error: AxiosError | any) {
        handleErrors(error);
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
        handleErrors(error);
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
      validations: getSSOConfigConnectStepValidations(intl),
      stepName: intl.formatMessage({
        id: 'adminPortal.settings.sso.connect',
        defaultMessage: 'Connect',
        description: 'Step name for connecting to an identity provider',
      }),
      nextButtonConfig: () => ({
        buttonText: intl.formatMessage({
          id: 'adminPortal.settings.sso.next',
          defaultMessage: 'Next',
          description: 'Button text for moving to the next step',
        }),
        opensNewWindow: false,
        onClick: advanceConnectStep,
        preventDefaultErrorModal: true,
      }),
    }, {
      index: 1,
      formComponent: SSOConfigConfigureStep,
      validations: getSSOConfigConfigureStepValidations(intl),
      stepName: intl.formatMessage({
        id: 'adminPortal.settings.sso.configure.stepName',
        defaultMessage: 'Configure',
        description: 'Step name for configuring an identity provider',
      }),
      nextButtonConfig: () => ({
        buttonText: intl.formatMessage({
          id: 'adminPortal.settings.sso.configure.buttonText',
          defaultMessage: 'Configure',
          description: 'Button text for configuring an identity provider',
        }),
        opensNewWindow: false,
        onClick: saveChanges,
        preventDefaultErrorModal: true,
      }),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 2,
      formComponent: SSOConfigAuthorizeStep,
      validations: getSSOConfigAuthorizeStepValidations(intl),
      stepName: intl.formatMessage({
        id: 'adminPortal.settings.sso.authorize',
        defaultMessage: 'Authorize',
        description: 'Step name for authorizing an identity provider',
      }),
      nextButtonConfig: () => ({
        buttonText: intl.formatMessage({
          id: 'adminPortal.settings.sso.next',
          defaultMessage: 'Next',
          description: 'Button text for moving to the next step',
        }),
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
      stepName: intl.formatMessage({
        id: 'adminPortal.settings.sso.confirmAndTest',
        defaultMessage: 'Confirm and Test',
        description: 'Step name for confirming and testing an identity provider',
      }),
      nextButtonConfig: () => ({
        buttonText: intl.formatMessage({
          id: 'adminPortal.settings.sso.finish',
          defaultMessage: 'Finish',
          description: 'Button text for finishing the configuration',
        }),
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
