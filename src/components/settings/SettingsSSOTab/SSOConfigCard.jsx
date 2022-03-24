import PropTypes from 'prop-types';
import {
  ActionRow,
  Badge,
  Card,
  Hyperlink,
} from '@edx/paragon';
import { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { logInfo } from '@edx/frontend-platform/logging';
import { connect } from 'react-redux';
import { SSOConfigContext } from './SSOConfigContext';
import {
  setProviderConfig,
  updateConnectInProgress,
  updateConnectIsSsoValid,
  updateCurrentError,
  updateCurrentstep,
} from './data/actions';
import { useInterval } from '../../../data/hooks';
import LmsApiService from '../../../data/services/LmsApiService';

const SSOConfigCard = ({ config, testLink, enterpriseId }) => {
  const { ssoState, dispatchSsoState } = useContext(SSOConfigContext);
  const { connect: { inProgress, isSsoValid } } = ssoState;
  const [interval, setInterval] = useState(null);
  const LIMIT_MILLIS = 120000;

  const startTime = performance.now();
  useInterval(async () => {
    try {
      const response = await LmsApiService.getProviderConfig(enterpriseId);
      const providerConfigs = response.data.results;
      const theProvider = providerConfigs.filter(aConfig => aConfig.id === config.id).shift();
      dispatchSsoState(setProviderConfig(theProvider));
      if (theProvider && theProvider.was_valid_at && theProvider.was_valid_at !== null) {
        dispatchSsoState(updateConnectIsSsoValid(true));
        dispatchSsoState(updateConnectInProgress(false));
        setInterval(null);
      } else {
        // if time has elapsed, then we can warn user: TODO
        // eslint-disable-next-line no-lonely-if
        if (performance.now() - startTime > LIMIT_MILLIS) {
          setInterval(null); // disable the polling
          dispatchSsoState(updateCurrentError('Cannot validate SSO, please make changes and try again'));
        }
      }
    } catch (error) { dispatchSsoState(updateCurrentError(error)); setInterval(null); }
  }, interval);
  const initiateValidation = () => {
    setInterval(1000);
    dispatchSsoState(updateConnectInProgress(true));
  };
  // until isValid is false, keep checking server state (after about 3 minutes, reset and message customer)
  useEffect(() => {
    if (isSsoValid) {
      setInterval(null); // just in case, disable the timer
      dispatchSsoState(updateConnectInProgress(false));
      dispatchSsoState(updateCurrentstep('idp'));
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
  return !inProgress ? (
    <Card isClickable>
      <Card.Header
        size="sm"
        title={config.name}
        actions={(
          <ActionRow>
            {!inProgress && <Hyperlink destination={testLink} target="_blank" onClick={handleTestClick}>Test</Hyperlink>}
          </ActionRow>
        )}
      />
      <Card.Section>
        {!inProgress && <Badge variant="warning">configured</Badge>}{' '}
      </Card.Section>
    </Card>
  ) : <Skeleton>Testing of SSO in progress...Please wait a bit or reload page at a different time.</Skeleton>;
};

SSOConfigCard.propTypes = {
  config: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    id: PropTypes.number.isRequired,
  }).isRequired,
  testLink: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigCard);
