import type { FormWorkflowStep } from '../../forms/FormWorkflow';
import SSOConfigConnectStep from './steps/NewSSOConfigConnectStep';
import SSOConfigConfigureStep from './steps/NewSSOConfigConfigureStep';
import SSOConfigAuthorizeStep from './steps/NewSSOConfigAuthorizeStep';
import SSOConfigConfirmStep from './steps/NewSSOConfigConfirmStep';

type SSOConfigCamelCase = {};

export const SSOFormWorkflowConfig = () => {
  const placeHolderButton = (buttonName?: string) => () => ({
    buttonText: buttonName || 'Next',
    opensNewWindow: false,
    onClick: () => {},
  });

  const steps: FormWorkflowStep<SSOConfigCamelCase>[] = [
    {
      index: 0,
      formComponent: SSOConfigConnectStep,
      validations: [],
      stepName: 'Connect',
      nextButtonConfig: placeHolderButton(),
    }, {
      index: 1,
      formComponent: SSOConfigConfigureStep,
      validations: [],
      stepName: 'Configure',
      nextButtonConfig: placeHolderButton('Configure'),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 2,
      formComponent: SSOConfigAuthorizeStep,
      validations: [],
      stepName: 'Authorize',
      nextButtonConfig: placeHolderButton(),
      showBackButton: true,
      showCancelButton: false,
    }, {
      index: 3,
      formComponent: SSOConfigConfirmStep,
      validations: [],
      stepName: 'Confirm and Test',
      nextButtonConfig: placeHolderButton('Finish'),
      showBackButton: true,
      showCancelButton: false,
    },
  ];

  // Start at the first step
  const getCurrentStep = () => steps[0];

  return {
    getCurrentStep,
    steps,
  };
};

export default SSOFormWorkflowConfig;
