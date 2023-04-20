import {
  CANVAS_TYPE,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
  SUBMIT_TOAST_MESSAGE,
} from "../../../data/constants";
import type {
  FormWorkflowButtonConfig,
  FormWorkflowConfig,
  FormWorkflowStep,
  FormWorkflowHandlerArgs,
  // @ts-ignore
} from "../../../../forms/FormWorkflow.tsx";
import CanvasFormConfig, {
  CanvasConfigCamelCase,
  CanvasConfigSnakeCase,
} from "./SettingsLMSTab/LMSConfigs/Canvas/CanvasConfig";
import MoodleFormConfig, {
  MoodleConfigCamelCase,
  MoodleConfigSnakeCase,
} from "./SettingsLMSTab/LMSConfigs/Moodle/MoodleConfig";
import BlackboardFormConfig from "./SettingsLMSTab/LMSConfigs/Blackboard/BlackboardConfig";
import CornerstoneFormConfig from "./SettingsLMSTab/LMSConfigs/Cornerstone/CornerstoneConfig";
import DegreedFormConfig from "./SettingsLMSTab/LMSConfigs/Degreed/DegreedConfig";
import SAPFormConfig from "./SettingsLMSTab/LMSConfigs/SAP/SAPConfig";
import {
  BLACKBOARD_TYPE,
  CORNERSTONE_TYPE,
  DEGREED2_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from "./data/constants";
import LMSSelectorPage, {validations} from "./SettingsLMSTab/LMSSelectorPage";

const flowConfigs = {
  [BLACKBOARD_TYPE]: BlackboardFormConfig,
  [CANVAS_TYPE]: CanvasFormConfig,
  [CORNERSTONE_TYPE]: CornerstoneFormConfig,
  [DEGREED2_TYPE]: DegreedFormConfig,
  [MOODLE_TYPE]: MoodleFormConfig,
  [SAP_TYPE]: SAPFormConfig,
};

// TODO: Add remaining types
export type LMSConfigCamelCase = CanvasConfigCamelCase | MoodleConfigCamelCase;
export type LMSConfigSnakeCase = CanvasConfigSnakeCase | MoodleConfigSnakeCase;

export type LMSFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: LMSConfigCamelCase;
  existingConfigNames: string[];
  onSubmit: (LMSConfigCamelCase) => void;
  onClickCancel: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>;
  lms?: string;
};

export const LMSFormWorkflowConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
  existingConfigNames,
  channelMap,
  lms,
}: LMSFormConfigProps): FormWorkflowConfig<LMSConfigCamelCase> => {

  const lmsConfig =
    lms &&
    flowConfigs[lms](
      enterpriseCustomerUuid,
      onSubmit,
      onClickCancel,
      existingData,
      existingConfigNames,
      channelMap
    );

  const saveChanges = () => {
    // TODO: Handle saving LMS selection changes, if applicable
  };

  const handleSelectionSubmit = () => {
    // TODO: Submit LMS selection
  };

  let steps: FormWorkflowStep<CanvasConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: LMSSelectorPage,
      validations,
      stepName: "Select LMS",
      saveChanges,
      nextButtonConfig: () => {
        let config = {
          buttonText: "Next",
          opensNewWindow: false,
          onClick: handleSelectionSubmit,
        };
        return config as FormWorkflowButtonConfig<LMSConfigCamelCase>;
      },
    },
  ];

  // If we've selected an LMS, add its steps.  Otherwise add a placeholder Activate step
  if (lmsConfig) {
    steps = steps.concat(lmsConfig.steps);
  } else {
    steps = steps.concat(
      {
        index: 0,
        stepName: "Activate",
      }
    );
  }

  // Go to selector step if the config has not yet been created
  const getCurrentStep = () => {
    const startStep: number = existingData.id ? 1 : 0;
    return steps[startStep];
  };

  return {
    ...lmsConfig,
    getCurrentStep,
    steps,
  };
};

export default LMSFormWorkflowConfig;
