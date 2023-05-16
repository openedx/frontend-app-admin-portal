import { snakeCaseDict } from '../../../../../utils';
import { SAP_TYPE } from '../../../data/constants';
import ConfigActivatePage from '../ConfigBasePages/ConfigActivatePage';
import SAPConfigEnablePage, { validations } from './SAPConfigEnablePage';
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
} from '../../../../forms/FormWorkflow';
import {
  activateConfig, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper,
} from '../utils';

export type SAPConfigCamelCase = {
  lms: string;
  displayName: string;
  sapBaseUrl: string;
  sapCompanyId: string;
  sapUserId: string;
  oauthClientId: string;
  oauthClientSecret: string;
  sapUserType: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type SAPConfigSnakeCase = {
  lms: string;
  display_name: string;
  sap_base_url: string;
  sap_company_id: string;
  sap_user_id: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  sap_user_type: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type SAPFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: SAPConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (sapConfig: SAPConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>;
};

export const SAPFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap,
}: SAPFormConfigProps): FormWorkflowConfig<SAPConfigCamelCase> => {
  const saveChanges = async (
    formFields: SAPConfigCamelCase,
    errHandler: (errMsg: string) => void,
  ) => {
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, SAP_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<SAPConfigCamelCase>) => {
    const currentFormFields = formFields;
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid,
      transformedConfig,
      existingData,
      onSubmit,
      formFieldsChanged,
      currentFormFields,
      SAP_TYPE,
      channelMap,
      errHandler,
      dispatch,
    );
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<SAPConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, SAP_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(SAP_TYPE);

  const steps: FormWorkflowStep<SAPConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: SAPConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
      stepName: 'Enable',
      saveChanges,
      nextButtonConfig: () => {
        const config = {
          buttonText: 'Enable',
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<SAPConfigCamelCase>;
      },
    },
    {
      index: 2,
      formComponent: activatePage,
      validations: [],
      stepName: 'Activate',
      saveChanges,
      nextButtonConfig: () => {
        const config = {
          buttonText: 'Activate',
          opensNewWindow: false,
          onClick: activate,
        };
        return config as FormWorkflowButtonConfig<SAPConfigCamelCase>;
      },
    },
  ];

  // Go to authorize step for now
  const getCurrentStep = () => steps[0];

  return {
    getCurrentStep,
    steps,
  };
};

export default SAPFormConfig;
