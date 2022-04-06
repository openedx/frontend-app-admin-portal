import { getConfig } from '@edx/frontend-platform/config';
import { Form, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { createSAMLURLs } from '../../../SamlProviderConfiguration/utils';
import { updateServiceProviderConfigured } from '../data/actions';
import { SSOConfigContext } from '../SSOConfigContext';

const SSOConfigServiceProviderStep = ({ enterpriseSlug, learnerPortalEnabled }) => {
  const {
    ssoState: { providerConfig: { slug: idpSlug }, serviceprovider: { isSPConfigured } },
    dispatchSsoState,
  } = useContext(SSOConfigContext);
  const handleChange = event => dispatchSsoState(updateServiceProviderConfigured(event.target.checked));
  const configuration = getConfig();
  const { spMetadataLink } = createSAMLURLs({
    configuration,
    idpSlug,
    enterpriseSlug,
    learnerPortalEnabled,
  });
  return (
    <>
      <p>
        Next step is configuring your SAML Identity Provider service to recognize edX as a SAML Service Provider.
        In your SAML Identity Provider service, use the SAML metadata obtained from the edX service provider{' '}
        <Hyperlink destination={spMetadataLink} target="_blank">metadata file</Hyperlink> to add edX to your whitelist of authorized SAML service providers.
      </p>
      <p>
        Once this is done, confirm that you&apos;ve successfully added edX as a Service Provider
        by checking the box below.
      </p>
      <Form.Checkbox className="mt-4" checked={isSPConfigured} onChange={handleChange}>
        I have added edX as a Service Provider in my SAML configuration
      </Form.Checkbox>
    </>
  );
};

SSOConfigServiceProviderStep.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  learnerPortalEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SSOConfigServiceProviderStep);
