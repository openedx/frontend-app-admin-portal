import React from 'react';
import SSOStepper from './SSOStepper';

const NewSSOConfigForm = () => (
  <div className="sso-create-form mt-4.5">
    <span>
      Connect to SAML identity provider for single sign-on,
      such as Okta or OneLogin to allow quick access to your organization&apos;s learning catalog.
    </span>
    <SSOStepper />
  </div>
);
export default NewSSOConfigForm;
