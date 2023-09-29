import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  CheckCircle, Warning,
} from '@edx/paragon/icons';
import { Alert } from '@edx/paragon';

const NewSSOConfigAlerts = ({
  inProgressConfigs,
  untestedConfigs,
  liveConfigs,
  notConfigured,
  contactEmail,
  closeAlerts,
}) => (
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
          &emsp; http://courses.edx.org/dashboard?tpa_hint=saml-bestrun-hana<br />
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
    {liveConfigs.length >= 1 && inProgressConfigs.length === 0 && untestedConfigs.length === 0 && (
      <Alert
        variant="success"
        className="ml-0 w-75"
        icon={CheckCircle}
        onClose={closeAlerts}
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

NewSSOConfigAlerts.propTypes = {
  inProgressConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  untestedConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  liveConfigs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notConfigured: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  closeAlerts: PropTypes.func.isRequired,
  contactEmail: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
});

export default connect(mapStateToProps)(NewSSOConfigAlerts);
