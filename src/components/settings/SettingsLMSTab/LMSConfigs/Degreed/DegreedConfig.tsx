import { snakeCaseDict } from '../../../../../utils';
import { DEGREED2_TYPE } from '../../../data/constants';
import ConfigActivatePage from '../ConfigBasePages/ConfigActivatePage';
import DegreedConfigAuthorizePage, { validations } from './DegreedConfigEnablePage';
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
} from '../../../../forms/FormWorkflow';
import {
  activateConfig, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper,
} from '../utils';
import type { DegreedConfigCamelCase, DegreedConfigSnakeCase } from './DegreedTypes';

export type DegreedFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: DegreedConfigCamelCase;
  existingConfigNames: Map<string, string>;
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
    errHandler: (errMsg: string) => void,
  ) => {
    const snakeConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as DegreedConfigSnakeCase;
    snakeConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(snakeConfig, existingData, formFields, onSubmit, DEGREED2_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<DegreedConfigCamelCase>) => {
    const currentFormFields = formFields;
    const transformedConfig: DegreedConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as DegreedConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid,
      transformedConfig,
      existingData,
      onSubmit,
      formFieldsChanged,
      currentFormFields,
      DEGREED2_TYPE,
      channelMap,
      errHandler,
      dispatch,
    );
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
      stepName: 'Enable',
      saveChanges,
      nextButtonConfig: () => {
        const config = {
          buttonText: 'Enable',
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
      stepName: 'Activate',
      saveChanges,
      nextButtonConfig: () => {
        const config = {
          buttonText: 'Activate',
          opensNewWindow: false,
          onClick: activate,
        };
        return config as FormWorkflowButtonConfig<DegreedConfigCamelCase>;
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

export default DegreedFormConfig;
