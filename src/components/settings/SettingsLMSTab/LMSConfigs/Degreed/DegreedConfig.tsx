import { snakeCaseDict } from "../../../../../utils";
import { DEGREED2_TYPE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import DegreedConfigAuthorizePage, { validations } from "./DegreedConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import { activateConfig, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper } from "../utils.tsx";

export type DegreedConfigCamelCase = {
  lms: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  degreedBaseUrl: string;
  degreedTokenFetchBaseUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type DegreedConfigSnakeCase = {
  lms: string;
  display_name: string;
  client_id: string;
  client_secret: string;
  degreed_base_url: string;
  degreed_token_fetch_base_url: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};

export type DegreedFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: DegreedConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (degreedConfig: DegreedConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>,
};

export const DegreedFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap,
}: DegreedFormConfigProps): FormWorkflowConfig<DegreedConfigCamelCase> => {
  const saveChanges = async (
    formFields: DegreedConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, DEGREED2_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<DegreedConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged, 
      currentFormFields, DEGREED2_TYPE, channelMap, errHandler, dispatch);
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<DegreedConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, DEGREED2_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(DEGREED2_TYPE);
  const steps: FormWorkflowStep<DegreedConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: DegreedConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames)]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<DegreedConfigCamelCase>;
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
        return config as FormWorkflowButtonConfig<DegreedConfigCamelCase>;
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

export default DegreedFormConfig;
