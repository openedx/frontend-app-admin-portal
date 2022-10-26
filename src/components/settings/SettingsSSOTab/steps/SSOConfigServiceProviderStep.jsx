import { getConfig } from '@edx/frontend-platform/config';
import { Form, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { createSAMLURLs } from '../utils';
import { updateServiceProviderConfigured } from '../data/actions';
import { SSOConfigContext } from '../SSOConfigContext';

function SSOConfigServiceProviderStep({ enterpriseSlug, learnerPortalEnabled }) {
  const {
    ssoState,
    dispatchSsoState,
  } = useContext(SSOConfigContext);
  const handleChange = event => dispatchSsoState(updateServiceProviderConfigured(event.target.checked));
  const configuration = getConfig();
  const idpSlug = ssoState.providerConfig?.slug;
  const { isSPConfigured } = ssoState.serviceprovider;
  const { spMetadataLink } = createSAMLURLs({
    configuration,
    idpSlug,
    enterpriseSlug,
    learnerPortalEnabled,
  });
  return (
    <>
      <p>
        The next step is to add edX as a SAML Service Provider in your SAML Identity Provider&apos;s service.
      </p>
      <p>
        Follow this process to do so:
      </p>
      <ul>
        <li>
          Save this edX Service Provider <Hyperlink destination={spMetadataLink} target="_blank">metadata file</Hyperlink> as an XML file
        </li>
        <li>
          Upload or add the XML file to your Identity Provider’s list of authorized SAML Service Providers
        </li>
        <li>
          Check the box below once edX has been successfully added as a Service Provider
        </li>
      </ul>
      <Form.Checkbox className="mt-4" checked={isSPConfigured} onChange={handleChange}>
        I have added edX as a Service Provider in my SAML configuration
      </Form.Checkbox>
    </>
  );
}

SSOConfigServiceProviderStep.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  learnerPortalEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SSOConfigServiceProviderStep);
