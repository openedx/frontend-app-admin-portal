import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Alert, Hyperlink } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SSOConfigContext } from './SSOConfigContext';
import SSOStepper from './SSOStepper';
import { HELP_CENTER_SAML_LINK } from '../data/constants';
import { features } from '../../../config';
import NewSSOStepper from './NewSSOStepper';

const NewSSOConfigForm = ({ setIsStepperOpen, isStepperOpen }) => {
  const { ssoState: { currentError } } = useContext(SSOConfigContext);
  const { AUTH0_SELF_SERVICE_INTEGRATION } = features;

  return (
    <div className="sso-create-form mt-4.5">
      {!AUTH0_SELF_SERVICE_INTEGRATION && (
        <span>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigForm.description"
            defaultMessage="Connect to a SAML identity provider for single sign-on to allow quick access to your organization's learning catalog."
            description="Description for the SSO configuration form"
          />
        </span>
      )}
      {AUTH0_SELF_SERVICE_INTEGRATION ? (
        <NewSSOStepper isStepperOpen={isStepperOpen} setIsStepperOpen={setIsStepperOpen} />
      ) : (
        <SSOStepper />
      )}
      {currentError && (
        <Alert
          variant="warning"
          stacked
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
            {currentError}
          </p>
        </Alert>
      )}
    </div>
  );
};

NewSSOConfigForm.propTypes = {
  setIsStepperOpen: PropTypes.func.isRequired,
  isStepperOpen: PropTypes.bool.isRequired,
};

export default NewSSOConfigForm;
