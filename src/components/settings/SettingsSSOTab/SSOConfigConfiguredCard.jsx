import PropTypes from 'prop-types';
import {
  Badge,
  Card,
} from '@edx/paragon';
import { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { logInfo } from '@edx/frontend-platform/logging';
import { connect } from 'react-redux';
import { SSOConfigContext } from './SSOConfigContext';
import {
  updateConnectInProgress,
} from './data/actions';
import { useInterval } from '../../../data/hooks';
import LmsApiService from '../../../data/services/LmsApiService';

/**
 * This is the clickable card that is used to test the SSO config before we complete the config creation process.
 */
const SSOConfigConfiguredCard = ({ config, testLink, enterpriseId }) => {
  const {
    ssoState, dispatchSsoState,
    setProviderConfig, setCurrentError, setIsSsoValid,
    setInfoMessage,
  } = useContext(SSOConfigContext);
  const { connect: { inProgress, isSsoValid } } = ssoState;
  const [interval, setInterval] = useState(null);
  const LIMIT_MILLIS = 120000;

  const startTime = performance.now();
  useInterval(async () => {
    try {
      const response = await LmsApiService.getProviderConfig(enterpriseId);
      const providerConfigs = response.data.results;
      const theProvider = providerConfigs.filter(
        aConfig => (aConfig.name === config.name) && (aConfig.entity_id === config.entity_id),
      ).shift();
      if (theProvider) { setProviderConfig(theProvider); }
      if (theProvider && theProvider.was_valid_at && theProvider.was_valid_at !== null) {
        dispatchSsoState(updateConnectInProgress(false));
        setIsSsoValid(true);
        setInfoMessage('SSO connected successfully');
        setInterval(null); // disable the polling
        // at this point we want to take users to the listing page showing this config
        // setting providerConfig to null will do that!
        // because the SettingsSSOTab/index.jsx is looking for that value
        setProviderConfig(null);
        setCurrentError(null);
      } else {
        // if time has elapsed, then we can warn user: TODO
        // eslint-disable-next-line no-lonely-if
        if (performance.now() - startTime > LIMIT_MILLIS) {
          setInterval(null); // disable the polling
          setIsSsoValid(false);
          setInfoMessage(null);
          dispatchSsoState(updateConnectInProgress(false));
          setCurrentError('Cannot validate SSO, please make changes and try again');
        }
      }
    } catch (error) { setCurrentError(error); setInterval(null); }
  }, interval);
  const initiateValidation = () => {
    dispatchSsoState(updateConnectInProgress(true));
    window.open(testLink);
    setInterval(1000);
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
  }, [isSsoValid]);
  const handleTestClick = () => {
    initiateValidation();
    return true;
  };
  return (
    <>
      {!inProgress && (
        <p>
          Lastly, let us test your configuration. Click on a card below to connect to edX via your SSO.
        </p>
      )}
      {inProgress && (
      <p>
        Please connect via SSO in the newly opened window. Checking for successful SSO connection...
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
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigConfiguredCard);
