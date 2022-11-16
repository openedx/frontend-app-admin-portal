import { getConfig } from '@edx/frontend-platform/config';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useExistingSSOConfigs } from '../hooks';
import SSOConfigConfiguredCard from '../SSOConfigConfiguredCard';
import { SSOConfigContext } from '../SSOConfigContext';
import { createSAMLURLs } from '../utils';

const SSOConfigConnectStep = ({
  enterpriseId, enterpriseSlug, learnerPortalEnabled, setConnectError, setShowValidatedText, showValidatedText,
}) => {
  // When we render this component, we need to re-fetch provider configs and update the store
  // so that we can correctly show latest state of providers
  // also, apply latest version of config to ssoState
  const { ssoState, setProviderConfig } = useContext(SSOConfigContext);
  const { providerConfig, refreshBool } = ssoState;
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId, refreshBool);
  const idpSlug = ssoState.providerConfig?.slug;

  useEffect(() => {
    if (isLoading) { return; } // don't want to do anything unless isLoading is done
    if (existingConfigs.length > 0 && providerConfig) {
      const updatedProviderConfig = existingConfigs.filter(config => config.id === providerConfig.id)
        .shift();
      setProviderConfig(updatedProviderConfig);
    }
  }, [isLoading, existingConfigs, setProviderConfig, providerConfig]);

  const configuration = getConfig();
  const { testLink } = createSAMLURLs({
    configuration,
    idpSlug,
    enterpriseSlug,
    learnerPortalEnabled,
  });

  return (
    <>
      {isLoading && <span>Loading SSO Configurations...</span>}
      {!isLoading && existingConfigs && existingConfigs.length > 0 && (
        <>
          <div>
            <SSOConfigConfiguredCard
              config={providerConfig}
              testLink={testLink}
              setConnectError={setConnectError}
              setShowValidatedText={setShowValidatedText}
              showValidatedText={showValidatedText}
            />
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
  enterpriseSlug: PropTypes.string.isRequired,
  learnerPortalEnabled: PropTypes.bool.isRequired,
  setConnectError: PropTypes.func.isRequired,
  setShowValidatedText: PropTypes.func.isRequired,
  showValidatedText: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SSOConfigConnectStep);
