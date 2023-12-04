import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  CheckCircle, Warning,
} from '@edx/paragon/icons';
import { Alert } from '@edx/paragon';
import Cookies from 'universal-cookie';

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
}) => {
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
  return (
    <>
      {inProgressConfigs.length >= 1 && (
        <Alert
          variant="warning"
          icon={Warning}
          className="ml-0 w-75"
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
          className="ml-0 w-75"
          onClose={closeAlerts}
          dismissible
        >
          <Alert.Heading>You need to test your SSO connection</Alert.Heading>
          <p>
            Your SSO configuration has completed,
            and you should have received an email with the following instructions:<br />
            <br />
            1. Copy the URL for your learner Portal dashboard below:<br />
            <br />
            &emsp; http://courses.edx.org/dashboard?tpa_hint={enterpriseSlug}<br />
            <br />
            2: Launch a new incognito or private window and paste the copied URL into the URL bar to load your
            learner Portal dashboard.<br />
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
          className="ml-0 w-75"
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
};

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(NewSSOConfigAlerts);
