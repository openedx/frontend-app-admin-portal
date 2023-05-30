import { useState } from "react";
import isEmpty from "lodash/isEmpty";

import { CANVAS_TYPE } from "../data/constants";
// @ts-ignore
import type { FormWorkflowConfig, FormWorkflowStep } from "../../../../forms/FormWorkflow.tsx";
// @ts-ignore
import BlackboardFormConfig, { BlackboardConfigCamelCase, BlackboardConfigSnakeCase } from "./LMSConfigs/Blackboard/BlackboardConfig.tsx";
// @ts-ignore
import CanvasFormConfig, { CanvasConfigCamelCase, CanvasConfigSnakeCase } from "./LMSConfigs/Canvas/CanvasConfig.tsx";
// @ts-ignore
import CornerstoneFormConfig, { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from "./LMSConfigs/Cornerstone/CornerstoneConfig.tsx";
// @ts-ignore
import DegreedFormConfig, { DegreedConfigCamelCase, DegreedConfigSnakeCase } from "./LMSConfigs/Degreed/DegreedConfig.tsx";
// @ts-ignore
import MoodleFormConfig, { MoodleConfigCamelCase, MoodleConfigSnakeCase } from "./LMSConfigs/Moodle/MoodleConfig.tsx";
// @ts-ignore
import SAPFormConfig, { SAPConfigCamelCase, SAPConfigSnakeCase } from "./LMSConfigs/SAP/SAPConfig.tsx";
import { BLACKBOARD_TYPE, CORNERSTONE_TYPE, DEGREED2_TYPE, MOODLE_TYPE, SAP_TYPE } from "../data/constants";
// @ts-ignore
import { LMSSelectorPage, validations} from "./LMSSelectorPage.tsx";

const flowConfigs = {
  [BLACKBOARD_TYPE]: BlackboardFormConfig,
  [CANVAS_TYPE]: CanvasFormConfig,
  [CORNERSTONE_TYPE]: CornerstoneFormConfig,
  [DEGREED2_TYPE]: DegreedFormConfig,
  [MOODLE_TYPE]: MoodleFormConfig,
  [SAP_TYPE]: SAPFormConfig,
};

export type LMSConfigCamelCase = BlackboardConfigCamelCase | CanvasConfigCamelCase | CornerstoneConfigCamelCase | DegreedConfigCamelCase
  | MoodleConfigCamelCase | SAPConfigCamelCase;
export type LMSConfigSnakeCase = BlackboardConfigSnakeCase | CanvasConfigSnakeCase | CornerstoneConfigSnakeCase | DegreedConfigSnakeCase
  | MoodleConfigSnakeCase | SAPConfigSnakeCase;

export type LMSFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: LMSConfigCamelCase;
  existingConfigNames: Map<string, string>;
  onSubmit: (LMSConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>;
  lmsType?: string;
};

export const LMSFormWorkflowConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap,
  lmsType,
}: LMSFormConfigProps): FormWorkflowConfig<LMSConfigCamelCase> => {
  const [lms, setLms] = useState(lmsType ? lmsType : '');
  // once an lms is selected by the user (or they are editing and existing one)
  // we dynamically render the correct FormConfig
  const lmsConfig =
    (lms && !isEmpty(lms)) &&
    flowConfigs[lms]({
      enterpriseCustomerUuid,
      onSubmit,
      handleCloseClick,
      existingData,
      existingConfigNames,
      channelMap
    });

  let steps: FormWorkflowStep<LMSConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: LMSSelectorPage(setLms),
      validations: validations,
      stepName: "Select LMS",
      nextButtonConfig: () => ({
        buttonText: "Next",
        opensNewWindow: false,
        onClick: () => {},
      }),
    },
  ];

  // If we've selected an LMS, add its steps. Otherwise add a placeholder steps
  if (lmsConfig) {
    steps = steps.concat(lmsConfig.steps);
  } else {
    steps = steps.concat(
      {
        index: 1,
        stepName: "Activate",
      },
      {
        index: 2,
        stepName: "Enable",
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
