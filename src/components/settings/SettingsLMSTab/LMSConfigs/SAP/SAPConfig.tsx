import { snakeCaseDict } from "../../../../../utils";
import { SAP_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import SAPConfigEnablePage, { validations } from "./SAPConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
} from "../../../../forms/FormWorkflow";
// @ts-ignore
import { checkForDuplicateNames, handleSaveHelper, handleSubmitHelper } from "../utils";

export type SAPConfigCamelCase = {
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
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const SAPFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: SAPFormConfigProps): FormWorkflowConfig<SAPConfigCamelCase> => {

  const saveChanges = async (
    formFields: SAPConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, SAP_TYPE, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<SAPConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: SAPConfigSnakeCase = snakeCaseDict(
      formFields
    ) as SAPConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged, currentFormFields, SAP_TYPE, errHandler, dispatch)
  };

  const activatePage = () => ConfigActivatePage(SAP_TYPE);

  const steps: FormWorkflowStep<SAPConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: SAPConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<SAPConfigCamelCase>;
      },
    },
    {
      index: 1,
      formComponent: activatePage,
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

export default SAPFormConfig;
