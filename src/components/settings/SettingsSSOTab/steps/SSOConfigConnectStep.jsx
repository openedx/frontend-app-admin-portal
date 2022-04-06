import { getConfig } from '@edx/frontend-platform/config';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useExistingSSOConfigs } from '../hooks';
import SSOConfigConfiguredCard from '../SSOConfigConfiguredCard';
import { SSOConfigContext } from '../SSOConfigContext';
import { createSAMLURLs } from '../../../SamlProviderConfiguration/utils';

const SSOConfigConnectStep = ({ enterpriseId, enterpriseSlug, learnerPortalEnabled }) => {
  // When we render this component, we need to re-fetch provider configs and update the store
  // so that we can correctly show latest state of providers
  // also, apply latest version of config to ssoState
  const { ssoState: { providerConfig }, setProviderConfig } = useContext(SSOConfigContext);
  const { slug: idpSlug } = providerConfig;
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId);
  useEffect(() => {
    if (isLoading) { return; } // don't want to do anything unless isLoading is done
    const updatedProviderConfig = existingConfigs.filter(config => config.id === providerConfig.id).shift();
    setProviderConfig(updatedProviderConfig);
  }, [existingConfigs]);
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
            <SSOConfigConfiguredCard config={providerConfig} testLink={testLink} />
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
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SSOConfigConnectStep);
