import React, { useState, useContext } from 'react';
import FormContextWrapper from '../../forms/FormContextWrapper';
import { SSOConfigContext } from './SSOConfigContext';
import SSOFormWorkflowConfig from './SSOFormWorkflowConfig';

const NewSSOStepper = () => {
  const {
    setProviderConfig,
  } = useContext(SSOConfigContext);
  const [isStepperOpen, setIsStepperOpen] = useState(true);
  const handleCloseWorkflow = () => {
    setProviderConfig?.(null);
    setIsStepperOpen(false);
  };

  return (isStepperOpen
    && (
    <div>
      <FormContextWrapper
        workflowTitle="New SSO integration"
        formWorkflowConfig={SSOFormWorkflowConfig()}
        onClickOut={handleCloseWorkflow}
        formData={{}}
        isStepperOpen={isStepperOpen}
      />
    </div>
    )
  );
};

export default NewSSOStepper;
