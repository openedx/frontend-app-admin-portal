import PropTypes from 'prop-types';
import {
  Form, Icon, OverlayTrigger, Popover, Button,
} from '@edx/paragon';
import { AddCircle, CheckCircle } from '@edx/paragon/icons';
import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SSOConfigContext } from './SSOConfigContext';
import { updateConnectInProgress, updateCurrentStep } from './data/actions';
import { SSO_CONFIG_POLLING_INTERVAL, SSO_CONFIG_POLLING_TIMEOUT } from '../data/constants';
import { useInterval } from '../../../data/hooks';
import LmsApiService from '../../../data/services/LmsApiService';

/**
 * This is the clickable card that is used to test the SSO config before we complete the config creation process.
 */
const SSOConfigConfiguredCard = ({
  config, testLink, enterpriseId, setConnectError, setShowValidatedText, showValidatedText,
}) => {
  const {
    ssoState, dispatchSsoState,
    setProviderConfig, setCurrentError, setIsSsoValid,
    setInfoMessage, setStartTime, setRefreshBool,
  } = useContext(SSOConfigContext);
  const {
    connect: { startTime },
    refreshBool,
  } = ssoState;
  const setCurrentStep = step => dispatchSsoState(updateCurrentStep(step));
  const [interval, setInterval] = useState(null);

  useInterval(async () => {
    try {
      const response = await LmsApiService.getProviderConfig(enterpriseId);
      const providerConfigs = response.data.results;
      const theProvider = providerConfigs.filter(
        aProviderConfig => (aProviderConfig.name === config.name) && (aProviderConfig.entity_id === config.entity_id),
      ).shift();
      if (theProvider) { setProviderConfig(theProvider); }
      if (theProvider?.was_valid_at !== null) {
        dispatchSsoState(updateConnectInProgress(false));
        setIsSsoValid(true);
        setInfoMessage('SSO connected successfully');
        setInterval(null); // disable the polling
        // at this point we want to take users to the listing page showing this config
        // setting providerConfig to null will do that!
        // because the SettingsSSOTab/index.jsx is looking for that value
        setProviderConfig(null);
        setCurrentError(null);
        setCurrentStep('idp');
        setRefreshBool(!refreshBool);
      } else if (performance.now() - startTime > SSO_CONFIG_POLLING_TIMEOUT) {
        // We've run out of time
        setInterval(null); // disable the polling
        setIsSsoValid(false);
        setInfoMessage(null);
        dispatchSsoState(updateConnectInProgress(false));
        setConnectError(true);
      }
    } catch (error) {
      setCurrentError(
        'Our system experienced an error. If this persists, please consult our help center.',
      );
      setInterval(null);
    }
  }, interval);
  const initiateValidation = () => {
    setStartTime(performance.now());
    dispatchSsoState(updateConnectInProgress(true));
    setInterval(SSO_CONFIG_POLLING_INTERVAL);
  };

  useEffect(() => {
    if (!config?.was_valid_at) {
      initiateValidation();
    } else {
      setShowValidatedText(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <p>
        Lastly, let us test your configuration. Copy the link below and paste into a separate browser/incognito
        window to connect to edX via your SSO.
      </p>
      <div>
        <Form.Group>
          <Form.Control
            className="float-left w-75 mr-0 sso-connect-step-copy-form"
            readOnly
            value={testLink}
          />
          <OverlayTrigger
            trigger="focus"
            placement="top"
            overlay={(
              <Popover id="popover-positioned-top">
                <Popover.Content>
                  <strong>Copied!</strong>
                </Popover.Content>
              </Popover>
            )}
          >
            <Button
              className="sso-connect-step-copy-button"
              onClick={() => { navigator.clipboard.writeText(testLink); }}
            >
              <Icon src={AddCircle} />
            </Button>
          </OverlayTrigger>
        </Form.Group>
      </div>
      { !showValidatedText && (
        <p className="mt-4">
          Once you&apos;ve successfully logged in,
          use this page to verify that your configuration is completed and validated.
        </p>
      )}
      { showValidatedText && (
        <div>
          <CheckCircle className="float-left mr-2 sso-connect-success-icon" />
          <p className="mt-4">
            You&apos;ve successfully logged in with your SSO configuration, feel free to use the
            link above in a private browser to test your configuration again or click Submit to finish.
          </p>
        </div>
      )}
    </>
  );
};

SSOConfigConfiguredCard.propTypes = {
  config: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    id: PropTypes.number,
    entity_id: PropTypes.string,
    was_valid_at: PropTypes.string,
  }),
  testLink: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  setConnectError: PropTypes.func.isRequired,
  setShowValidatedText: PropTypes.func.isRequired,
  showValidatedText: PropTypes.bool.isRequired,
};

SSOConfigConfiguredCard.defaultProps = {
  config: {
    was_valid_at: '', name: '', slug: '', id: -1, entity_id: '',
  },
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigConfiguredCard);
