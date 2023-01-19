import isEmpty from "lodash/isEmpty";

import handleErrors from "../../../utils";
import LmsApiService from "../../../../../data/services/LmsApiService";
import { snakeCaseDict } from "../../../../../utils";
import { SUBMIT_TOAST_MESSAGE } from "../../../data/constants";
// @ts-ignore
import CanvasConfigActivatePage from "./CanvasConfigActivatePage.tsx";
import CanvasConfigAuthorizePage, {
  validations,
  // @ts-ignore
} from "./CanvasConfigAuthorizePage.tsx";
import type { FormWorkflowConfig, FormWorkflowStep } from "../../../../forms/FormWorkflow";

export type CanvasConfigCamelCase = {
  canvasAccountId: string;
  canvasBaseUrl: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  id: string;
  active: boolean;
  uuid: string;
};

// TODO: Can we generate this dynamically?
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export type CanvasConfigSnakeCase = {
  canvas_account_id: string;
  canvas_base_url: string;
  display_name: string;
  client_id: string;
  client_secret: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};

// TODO: Make this a generic type usable by all lms configs
export type CanvasFormConfigProps = {
  enterpriseCustomerUuid: string;
  existingData: CanvasConfigCamelCase;
  onSubmit: (canvasConfig: CanvasConfigCamelCase) => CanvasConfigSnakeCase;
  onClickCancel: (submitted: boolean, status: string) => Promise<void>;
};

export const CanvasFormConfig = ({
  enterpriseCustomerUuid,
  onSubmit,
  onClickCancel,
  existingData,
}: CanvasFormConfigProps): FormWorkflowConfig<CanvasConfigCamelCase> => {
  const saveChanges = async (formFields: CanvasConfigCamelCase) => {
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;

    if (!isEmpty(existingData)) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateCanvasConfig(
          transformedConfig,
          existingData.id
        );
        onSubmit(formFields);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      // TODO: Don't expose option if object not created yet
    }
  };
  
  const handleSubmit = async (
    formFields: CanvasConfigCamelCase
  ) => {
    const transformedConfig: CanvasConfigSnakeCase = snakeCaseDict(
      formFields
    ) as CanvasConfigSnakeCase;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;

    if (formFields.id) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateCanvasConfig(
          transformedConfig,
          existingData.id
        );
        onSubmit(formFields);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewCanvasConfig(transformedConfig);
        onSubmit(formFields);
      } catch (error) {
        err = handleErrors(error);
      }
    }
    if (err) {
      // TODO: Do something to open error model elsewhere?
      // openError();
    } else {
      // TODO: Make this happen on final step
      // onClickCancel(SUBMIT_TOAST_MESSAGE);
    }
  };

  // TODO: Fix handleSubmit
  const steps: FormWorkflowStep<CanvasConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: CanvasConfigAuthorizePage,
      validations,
      stepName: "Authorize",
      saveChanges,
      nextButtonConfig: {
        buttonText: "Authorize",
        onClick: handleSubmit,
      },
    },
    {
      index: 1,
      formComponent: CanvasConfigActivatePage,
      validations: [],
      stepName: "Activate",
      saveChanges,
      nextButtonConfig: {
        buttonText: "Activate",
        onClick: () => onClickCancel(true, SUBMIT_TOAST_MESSAGE),
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

export default CanvasFormConfig;
