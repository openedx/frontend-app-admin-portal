import { snakeCaseDict } from "../../../../../utils";
import { MOODLE_TYPE } from "../../../data/constants";
// @ts-ignore
import ConfigActivatePage from "../ConfigBasePages/ConfigActivatePage.tsx";
  // @ts-ignore
import MoodleConfigEnablePage, { validations } from "./MoodleConfigEnablePage.tsx";
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import { activateConfig, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper } from "../utils.tsx";

export type MoodleConfigCamelCase = {
  lms: string;
  displayName: string;
  moodleBaseUrl: string;
  serviceShortName: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type MoodleConfigSnakeCase = {
  lms: string;
  display_name: string;
  moodle_base_url: string;
  service_short_name: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

export type MoodleFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: MoodleConfigCamelCase;
  existingConfigNames: Map<string, string>;
  onSubmit: (moodleConfig: MoodleConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>;
};

export const MoodleFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap, 
}: MoodleFormConfigProps): FormWorkflowConfig<MoodleConfigCamelCase> => {

  const saveChanges = async (
    formFields: MoodleConfigCamelCase,
    errHandler: (errMsg: string) => void
  ) => {
    const transformedConfig: MoodleConfigSnakeCase = snakeCaseDict(
      formFields
    ) as MoodleConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(transformedConfig, existingData, formFields, onSubmit, MOODLE_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<MoodleConfigCamelCase>) => {
    let currentFormFields = formFields;
    const transformedConfig: MoodleConfigSnakeCase = snakeCaseDict(
      formFields
    ) as MoodleConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid, transformedConfig, existingData, onSubmit, formFieldsChanged,
      currentFormFields, MOODLE_TYPE, channelMap, errHandler, dispatch)
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<MoodleConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, MOODLE_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(MOODLE_TYPE);

  const steps: FormWorkflowStep<MoodleConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: MoodleConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames)]),
      stepName: "Configure",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Enable",
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<MoodleConfigCamelCase>;
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
        return config as FormWorkflowButtonConfig<MoodleConfigCamelCase>;
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

export default MoodleFormConfig;
