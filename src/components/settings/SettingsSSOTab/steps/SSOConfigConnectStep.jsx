import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { setProviderConfig } from '../data/actions';
import { useExistingSSOConfigs } from '../hooks';
import SSOConfigCard from '../SSOConfigCard';
import { SSOConfigContext } from '../SSOConfigContext';

const SSOConfigConnectStep = ({ enterpriseId }) => {
  // When we render this cmponent, we need to re-fetch provider configs and updatee the store
  // so that we can correctly show latest state of providers
  // apply latest version of config to ssoState
  const { ssoState: { providerConfig }, dispatchSsoState } = useContext(SSOConfigContext);

  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId);
  useEffect(() => {
    if (isLoading) { return; } // don't want to do anything unless isLoading is done
    const updatedProviderConfig = existingConfigs.filter(config => config.id === providerConfig.id).shift();
    dispatchSsoState(setProviderConfig(updatedProviderConfig));
  }, [existingConfigs]);
  return (
    <>
      {isLoading && <span>Loading SSO Configurations...</span>}
      {!isLoading && existingConfigs && existingConfigs.length > 0 && (
        <>
          <p>
            Lastly, let us test your configuration. Click on a card below to connect to edX via your SSO.
          </p>
          <div className="d-flex">
            <SSOConfigCard config={providerConfig} />
          </div>
        </>
      )}
      {!isLoading && existingConfigs && existingConfigs.length === 0 && (
        <Alert variant="warning">
          Sorry, something must have gone wrong, we cannot find any SSO setup.
          Please go back to prior steps and try saving your config again.
        </Alert>
      )}
      {error && !isLoading && <Alert variant="warning">{error}</Alert>}
    </>
  );
};

SSOConfigConnectStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigConnectStep);