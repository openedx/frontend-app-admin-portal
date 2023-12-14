import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  CheckCircle, Info, Warning,
} from '@openedx/paragon/icons';
import { Alert, Button } from '@openedx/paragon';
import Cookies from 'universal-cookie';
import { SSOConfigContext } from './SSOConfigContext';

export const SSO_SETUP_COMPLETION_COOKIE_NAME = 'dismissed-sso-completion-alert';
const SSO_ALERT_OVERRIDE_PARAM = 'sso_alert_override';
const ssoCookies = new Cookies();

const NewSSOConfigAlerts = ({
  inProgressConfigs,
  untestedConfigs,
  liveConfigs,
  notConfigured,
  contactEmail,
  closeAlerts,
  enterpriseSlug,
  timedOutConfigs,
  erroredConfigs,
  setIsStepperOpen,
}) => {
  const { setProviderConfig } = useContext(SSOConfigContext);

  const configureOnClick = (config) => {
    setProviderConfig(config);
    setIsStepperOpen(true);
  };
  const onTimedOutConfigureClick = () => configureOnClick(timedOutConfigs[0]);
  const onErroredConfigClick = () => configureOnClick(erroredConfigs[0]);

  const dismissSetupCompleteAlert = () => {
    ssoCookies.set(
      SSO_SETUP_COMPLETION_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
    closeAlerts();
  };

  const searchParams = new URLSearchParams(window.location.search);
  const dismissedSSOSetupCompletionCookie = ssoCookies.get(SSO_SETUP_COMPLETION_COOKIE_NAME) === 'true';
  const hideSSOLiveAlert = dismissedSSOSetupCompletionCookie && !searchParams.get(SSO_ALERT_OVERRIDE_PARAM);

  const [showTimeoutAlert, setShowTimeoutAlert] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(true);

  if (timedOutConfigs.length >= 1) {
    return (
      <Alert
        variant="danger"
        icon={Info}
        className="sso-alert-width"
        actions={[
          <Button data-testid="sso-timeout-alert-configure" onClick={onTimedOutConfigureClick}>Configure</Button>,
        ]}
        dismissible
        show={showTimeoutAlert}
        onClose={() => { setShowTimeoutAlert(false); }}
        stacked
      >
        <Alert.Heading>SSO Configuration timed out</Alert.Heading>
        <p>
          Your SSO configuration failed due to an internal error. Please try again by selecting “Configure” below and
          {' '}verifying your integration details. Then reconfigure, reauthorize, and test your connection.
        </p>
      </Alert>
    );
  }

  if (erroredConfigs.length >= 1) {
    return (
      <Alert
        variant="danger"
        icon={Info}
        className="sso-alert-width"
        show={showErrorAlert}
        actions={[
          <Button data-testid="sso-errored-alert-configure" onClick={onErroredConfigClick}>Configure</Button>,
        ]}
        dismissible
        onClose={() => { setShowErrorAlert(false); }}
        stacked
      >
        <Alert.Heading>SSO Configuration failed</Alert.Heading>
        <p>
          Please verify integration details have been entered correctly. Select “Configure” below and verify your
          {' '}integration details. Then reconfigure, reauthorize, and test your connection.
        </p>
      </Alert>
    );
  }

  return (
    <>
      {inProgressConfigs.length >= 1 && (
        <Alert
          variant="warning"
          icon={Warning}
          className="ml-0 sso-alert-width"
          dismissible
          onClose={closeAlerts}
        >
          <Alert.Heading>Your SSO Integration is in progress</Alert.Heading>
          <p>
            edX is configuring your SSO. This step takes approximately{' '}
            {notConfigured.length > 0 ? `five minutes. You will receive an email at ${contactEmail} when the configuration is complete` : 'fifteen seconds'}.
          </p>
        </Alert>
      )}
      {untestedConfigs.length >= 1 && inProgressConfigs.length === 0 && (
        <Alert
          variant="warning"
          icon={Warning}
          className="ml-0 sso-alert-width"
          onClose={closeAlerts}
          dismissible
        >
          <Alert.Heading>You need to test your SSO connection</Alert.Heading>
          <p>
            Your SSO configuration has been completed,
            and you should have received an email with the following instructions:<br />
            <br />
            1: Copy the URL for your Learner Portal dashboard below:<br />
            <br />
            &emsp; http://courses.edx.org/dashboard?tpa_hint={enterpriseSlug}<br />
            <br />
            2: Launch a new incognito or private window and paste the copied URL into the URL bar to load your
            Learner Portal dashboard.<br />
            <br />
            3: When prompted, enter login credentials supported by your IDP to test your connection to edX.<br />
            <br />
            Return to this window after completing the testing instructions.
            This window will automatically update when a successful test is detected.<br />
          </p>
        </Alert>
      )}
      {liveConfigs.length >= 1 && (
        inProgressConfigs.length === 0) && (
        untestedConfigs.length === 0) && (
        !hideSSOLiveAlert) && (
        <Alert
          variant="success"
          className="ml-0 sso-alert-width"
          icon={CheckCircle}
          onClose={dismissSetupCompleteAlert}
          dismissible
        >
          <Alert.Heading>Your SSO integration is live!</Alert.Heading>
          <p>
            Great news! Your test was successful and your new SSO integration is live and ready to use.
          </p>
        </Alert>
      )}
    </>
  );
};

NewSSOConfigAlerts.propTypes = {
  inProgressConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  untestedConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  liveConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notConfigured: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  closeAlerts: PropTypes.func.isRequired,
  contactEmail: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  erroredConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  timedOutConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setIsStepperOpen: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(NewSSOConfigAlerts);
