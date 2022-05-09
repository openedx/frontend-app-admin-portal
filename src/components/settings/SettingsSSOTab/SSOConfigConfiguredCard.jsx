import PropTypes from 'prop-types';
import { Badge, Card, Hyperlink } from '@edx/paragon';
import { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { logInfo } from '@edx/frontend-platform/logging';
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
  config, testLink, enterpriseId, setConnectError,
}) => {
  const {
    ssoState, dispatchSsoState,
    setProviderConfig, setCurrentError, setIsSsoValid,
    setInfoMessage, setStartTime,
  } = useContext(SSOConfigContext);
  const {
    connect: {
      startTime,
      inProgress,
      isSsoValid,
    },
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
        setConnectError(true);
        setProviderConfig(null);
        setCurrentError(null);
      } else if (performance.now() - startTime > SSO_CONFIG_POLLING_TIMEOUT) {
        setInterval(null); // disable the polling
        setIsSsoValid(false);
        setInfoMessage(null);
        dispatchSsoState(updateConnectInProgress(false));
        setConnectError(true);
        setCurrentStep('configure');
      }
    } catch (error) { setCurrentError(error); setInterval(null); }
  }, interval);
  const initiateValidation = () => {
    if (inProgress) {
      // make no op in case click happens again during prior progress.
      return;
    }
    setStartTime(performance.now());
    dispatchSsoState(updateConnectInProgress(true));
    window.open(testLink);
    setInterval(SSO_CONFIG_POLLING_INTERVAL);
  };
  // until isValid is false, keep checking server state (after about 3 minutes, reset and message customer)
  useEffect(() => {
    if (isSsoValid) {
      setInterval(null); // just in case, disable the timer
      dispatchSsoState(updateConnectInProgress(false));
      logInfo('SSO successfully validated');
    } else {
      // nothing to do right now
      logInfo('Waiting for SSO valid to become true');
    }
    return function cleanup() {
      setInterval(null); // so that when we unload, the timer is stopped
      dispatchSsoState(updateConnectInProgress(false));
    };
  }, [isSsoValid, dispatchSsoState]);

  const handleTestClick = () => {
    initiateValidation();
    return true;
  };
  return (
    <>
      {!inProgress && (
        <p>
          Lastly, let us test your configuration. Click on a card below to connect to edX via your SSO.
          (or visit <Hyperlink destination={testLink} target="_blank">this link</Hyperlink> in a separate browser/incognito window).
        </p>
      )}
      {inProgress && (
      <p>
        Please connect via SSO in the newly opened window
        (or visit <Hyperlink destination={testLink} target="_blank">this link</Hyperlink> in a separate browser/incognito window).
        Checking for successful SSO connection...
      </p>
      )}
      {!inProgress ? (
        <>
          <Card onClick={handleTestClick} style={{ maxWidth: '400px' }} isClickable>
            <Card.Header
              size="sm"
              title={config.name}
            />
            <Card.Section>
              {!isSsoValid && <Badge variant="warning">configured</Badge>}{' '}
              {isSsoValid && <Badge variant="success">completed</Badge>}{' '}
            </Card.Section>
          </Card>
        </>
      ) : <Skeleton>Testing of SSO in progress...Please wait a bit or reload page at a different time.</Skeleton>}
    </>
  );
};

SSOConfigConfiguredCard.propTypes = {
  config: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    entity_id: PropTypes.string.isRequired,
  }).isRequired,
  testLink: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  setConnectError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigConfiguredCard);
