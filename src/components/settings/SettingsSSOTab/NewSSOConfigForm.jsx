import React, { useContext, useState } from 'react';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { SSOConfigContext } from './SSOConfigContext';
import SSOStepper from './SSOStepper';
import { HELP_CENTER_SAML_LINK } from '../data/constants';

const NewSSOConfigForm = () => {
  const { ssoState: { currentError } } = useContext(SSOConfigContext);
  const [isWarningOpen, setisWarningOpen] = useState(true);
  return (
    <div className="sso-create-form mt-4.5">
      <span>
        Connect to a SAML identity provider for single sign-on
        to allow quick access to your organization&apos;s learning catalog.
      </span>
      <SSOStepper />
      {currentError && (
      <Alert
        variant="warning"
        stacked
        dismissible
        icon={WarningFilled}
        show={isWarningOpen}
        onClose={() => setisWarningOpen(false)}
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
          {currentError}
        </p>
      </Alert>
      )}
    </div>
  );
};
export default NewSSOConfigForm;
