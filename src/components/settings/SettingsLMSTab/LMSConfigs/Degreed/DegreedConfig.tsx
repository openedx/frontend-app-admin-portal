import { snakeCaseDict } from "../../../../../utils";
import { DEGREED2_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import DegreedConfigAuthorizePage, { validations } from "./DegreedConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
} from "../../../../forms/FormWorkflow";
// @ts-ignore
import { checkForDuplicateNames, handleSaveHelper, handleSubmitHelper } from "../utils";

export type DegreedConfigCamelCase = {
  displayName: string;
  clientId: string;
  clientSecret: string;
  degreedBaseUrl: string;
  degreedFetchUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type DegreedConfigSnakeCase = {
  display_name: string;
  client_id: string;
  client_secret: string;
  degreed_base_url: string;
  degreed_fetch_url: string;
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
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
};

export const DegreedFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
}: DegreedFormConfigProps): FormWorkflowConfig<DegreedConfigCamelCase> => {
  const saveChanges = async (
    formFields: DegreedConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, DEGREED2_TYPE, errHandler);
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
    return handleSubmitHelper(enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged, currentFormFields, DEGREED2_TYPE, errHandler, dispatch)
  };

  const activatePage = () => ConfigActivatePage(DEGREED2_TYPE);

  const steps: FormWorkflowStep<DegreedConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: DegreedConfigAuthorizePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
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

export default DegreedFormConfig;
