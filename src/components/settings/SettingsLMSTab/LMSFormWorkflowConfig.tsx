import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';

import {
  CANVAS_TYPE, BLACKBOARD_TYPE, CORNERSTONE_TYPE, DEGREED2_TYPE, MOODLE_TYPE, SAP_TYPE,
} from '../data/constants';
import type { FormWorkflowConfig, FormWorkflowStep } from '../../forms/FormWorkflow';
import BlackboardFormConfig from './LMSConfigs/Blackboard/BlackboardConfig';
import type { BlackboardConfigCamelCase, BlackboardConfigSnakeCase } from './LMSConfigs/Blackboard/BlackboardTypes';
import CanvasFormConfig from './LMSConfigs/Canvas/CanvasConfig';
import type { CanvasConfigCamelCase, CanvasConfigSnakeCase } from './LMSConfigs/Canvas/CanvasTypes';
import CornerstoneFormConfig from './LMSConfigs/Cornerstone/CornerstoneConfig';
import type { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from './LMSConfigs/Cornerstone/CornerstoneTypes';
import DegreedFormConfig from './LMSConfigs/Degreed/DegreedConfig';
import type { DegreedConfigCamelCase, DegreedConfigSnakeCase } from './LMSConfigs/Degreed/DegreedTypes';
import MoodleFormConfig from './LMSConfigs/Moodle/MoodleConfig';
import type { MoodleConfigCamelCase, MoodleConfigSnakeCase } from './LMSConfigs/Moodle/MoodleTypes';
import SAPFormConfig from './LMSConfigs/SAP/SAPConfig';
import type { SAPConfigCamelCase, SAPConfigSnakeCase } from './LMSConfigs/SAP/SAPTypes';
import { LMSSelectorPage, validations } from './LMSSelectorPage';

const flowConfigs = {
  [BLACKBOARD_TYPE]: BlackboardFormConfig,
  [CANVAS_TYPE]: CanvasFormConfig,
  [CORNERSTONE_TYPE]: CornerstoneFormConfig,
  [DEGREED2_TYPE]: DegreedFormConfig,
  [MOODLE_TYPE]: MoodleFormConfig,
  [SAP_TYPE]: SAPFormConfig,
};

export type LMSConfigCamelCase = BlackboardConfigCamelCase | CanvasConfigCamelCase | CornerstoneConfigCamelCase
| DegreedConfigCamelCase | MoodleConfigCamelCase | SAPConfigCamelCase;
export type LMSConfigSnakeCase = BlackboardConfigSnakeCase | CanvasConfigSnakeCase | CornerstoneConfigSnakeCase
| DegreedConfigSnakeCase | MoodleConfigSnakeCase | SAPConfigSnakeCase;

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
  const [lms, setLms] = useState(lmsType || '');
  // once an lms is selected by the user (or they are editing and existing one)
  // we dynamically render the correct FormConfig
  const lmsConfig = (lms && !isEmpty(lms))
    && flowConfigs[lms]({
      enterpriseCustomerUuid,
      onSubmit,
      handleCloseClick,
      existingData,
      existingConfigNames,
      channelMap,
    });

  let steps: FormWorkflowStep<LMSConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: LMSSelectorPage(setLms),
      validations,
      stepName: 'Select',
      nextButtonConfig: () => ({
        buttonText: 'Next',
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
        formComponent: LMSSelectorPage(setLms),
        validations,
        stepName: 'Activate',
        nextButtonConfig: () => ({
          buttonText: 'Next',
          opensNewWindow: false,
        }),
      },
      {
        index: 2,
        formComponent: LMSSelectorPage(setLms),
        validations,
        stepName: 'Enable',
        nextButtonConfig: () => ({
          buttonText: 'Next',
          opensNewWindow: false,
        }),
      },
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
