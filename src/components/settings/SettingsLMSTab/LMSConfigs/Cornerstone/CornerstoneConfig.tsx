import { snakeCaseDict } from "../../../../../utils";
import { CORNERSTONE_TYPE, SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
// @ts-ignore
import CornerstoneConfigEnablePage, { validations } from "./CornerstoneConfigEnablePage.tsx";
import type { 
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep,FormWorkflowHandlerArgs,
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import { checkForDuplicateNames, handleSaveHelper, handleSubmitHelper } from "../utils.tsx";

export type CornerstoneConfigCamelCase = {
  displayName: string;
  cornerstoneBaseUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type CornerstoneConfigSnakeCase = {
  display_name: string;
  cornerstone_base_url: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type CornerstoneFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CornerstoneConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (cornerstoneConfig: CornerstoneConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: { [key: string]: {[key: string]: any }},
};

export const CornerstoneFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
  channelMap,
}: CornerstoneFormConfigProps): FormWorkflowConfig<CornerstoneConfigCamelCase> => {

  const saveChanges = async (
    formFields: CornerstoneConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CornerstoneConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(
      transformedConfig, existingData, formFields, onSubmit, CORNERSTONE_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<CornerstoneConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CornerstoneConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged, currentFormFields, CORNERSTONE_TYPE, channelMap, errHandler, dispatch)
  };

  const activatePage = () => ConfigActivatePage(CORNERSTONE_TYPE);

  const steps: FormWorkflowStep<CornerstoneConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: CornerstoneConfigEnablePage, 
      validations: validations.concat([checkForDuplicateNames(existingConfigNames, existingData)]),
      stepName: "Enable",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<CornerstoneConfigCamelCase>;
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

export default CornerstoneFormConfig;
