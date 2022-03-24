import React, { useContext } from 'react';
import { Alert } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { SSOConfigContext } from './SSOConfigContext';
import SSOStepper from './SSOStepper';

const NewSSOConfigForm = () => {
  const { ssoState: { currentError } } = useContext(SSOConfigContext);
  return (
    <div className="sso-create-form mt-4.5">
      <span>
        Connect to SAML identity provider for single sign-on,
        such as Okta or OneLogin to allow quick access to your organization&apos;s learning catalog.
      </span>
      <SSOStepper />
      {currentError && <Alert variant="warning" icon={WarningFilled}>There has been an error {currentError}</Alert>}
    </div>
  );
};
export default NewSSOConfigForm;
