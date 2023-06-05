import { snakeCaseDict } from '../../../../../utils';
import { CORNERSTONE_TYPE } from '../../../data/constants';
import ConfigActivatePage from '../ConfigBasePages/ConfigActivatePage';
import CornerstoneConfigEnablePage, { validations } from './CornerstoneConfigEnablePage';
import type {
  FormWorkflowButtonConfig, FormWorkflowConfig, FormWorkflowStep, FormWorkflowHandlerArgs,
} from '../../../../forms/FormWorkflow';
import {
  activateConfig, checkForDuplicateNames, handleSaveHelper, handleSubmitHelper,
} from '../utils';
import type { CornerstoneConfigCamelCase, CornerstoneConfigSnakeCase } from './CornerstoneTypes';

export type CornerstoneFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CornerstoneConfigCamelCase;
  existingConfigNames: Map<string, string>;
  onSubmit: (cornerstoneConfig: CornerstoneConfigCamelCase) => void;
  handleCloseClick: (submitted: boolean, status: string) => Promise<boolean>;
  channelMap: Record<string, Record<string, any>>,
};

export const CornerstoneFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  handleCloseClick,
  existingData,
  existingConfigNames,
  channelMap,
}: CornerstoneFormConfigProps): FormWorkflowConfig<CornerstoneConfigCamelCase> => {
  const saveChanges = async (
    formFields: CornerstoneConfigCamelCase,
    errHandler: (errMsg: string) => void,
  ) => {
    const newConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as CornerstoneConfigSnakeCase;
    newConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSaveHelper(newConfig, existingData, formFields, onSubmit, CORNERSTONE_TYPE, channelMap, errHandler);
  };

  const handleSubmit = async ({
    formFields,
    formFieldsChanged,
    errHandler,
    dispatch,
  }: FormWorkflowHandlerArgs<CornerstoneConfigCamelCase>) => {
    const currentFormFields = formFields;
    const snakeConfig: CornerstoneConfigSnakeCase = snakeCaseDict(
      formFields,
    ) as CornerstoneConfigSnakeCase;
    snakeConfig.enterprise_customer = enterpriseCustomerUuid;
    return handleSubmitHelper(
      enterpriseCustomerUuid,
      snakeConfig,
      existingData,
      onSubmit,
      formFieldsChanged,
      currentFormFields,
      CORNERSTONE_TYPE,
      channelMap,
      errHandler,
      dispatch,
    );
  };

  const activate = async ({
    formFields,
    errHandler,
  }: FormWorkflowHandlerArgs<CornerstoneConfigCamelCase>) => {
    activateConfig(enterpriseCustomerUuid, channelMap, CORNERSTONE_TYPE, formFields?.id, handleCloseClick, errHandler);
    return formFields;
  };

  const activatePage = () => ConfigActivatePage(CORNERSTONE_TYPE);

  const steps: FormWorkflowStep<CornerstoneConfigCamelCase>[] = [
    {
      index: 1,
      formComponent: CornerstoneConfigEnablePage,
      validations: validations.concat([checkForDuplicateNames(existingConfigNames)]),
      stepName: 'Configure',
      saveChanges,
      nextButtonConfig: () => {
        const config = {
          buttonText: 'Enable',
          opensNewWindow: false,
          onClick: handleSubmit,
        };
        return config as FormWorkflowButtonConfig<CornerstoneConfigCamelCase>;
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
        return config as FormWorkflowButtonConfig<CornerstoneConfigCamelCase>;
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

export default CornerstoneFormConfig;
