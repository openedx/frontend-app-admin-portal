import React, { useContext } from 'react';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { SSOConfigContext } from './SSOConfigContext';
import SSOStepper from './SSOStepper';
import { HELP_CENTER_SAML_LINK } from '../data/constants';

const NewSSOConfigForm = () => {
  const { ssoState: { currentError } } = useContext(SSOConfigContext);
  return (
    <div className="sso-create-form mt-4.5">
      <span>
        Connect to SAML identity provider for single sign-on,
        such as Okta or OneLogin to allow quick access to your organization&apos;s learning catalog.
      </span>
      <SSOStepper />
      {currentError && (
      <Alert
        variant="warning"
        stacked
        dismissible
        icon={WarningFilled}
        actions={[
          <Hyperlink
            destination={HELP_CENTER_SAML_LINK}
            className="btn btn-sm btn-primary"
            target="_blank"
          >
            Help Center
          </Hyperlink>,
        ]}
      >
        <Alert.Heading>Something went wrong.</Alert.Heading>
        <p className="my-3">
          Our system experienced an error. If this persists, please consult our help center.
        </p>
      </Alert>
      )}
    </div>
  );
};
export default NewSSOConfigForm;
