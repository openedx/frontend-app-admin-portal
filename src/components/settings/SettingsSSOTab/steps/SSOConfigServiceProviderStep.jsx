import { Form } from '@edx/paragon';
import { useContext } from 'react';
import { updateServiceProviderConfigured } from '../data/actions';
import { SSOConfigContext } from '../SSOConfigContext';

const SSOConfigServiceProviderStep = () => {
  const {
    ssoState: { serviceprovider: { isSPConfigured } },
    dispatchSsoState,
  } = useContext(SSOConfigContext);
  const handleChange = event => dispatchSsoState(updateServiceProviderConfigured(event.target.checked));
  return (
    <>
      <p>
        Next step is configuring your SAML Identity Provider service to recognize edX as a SAML Service Provider.
        In your SAML Identity Provider service, use the SAML metadata obtained from the edX service provider
        metadata file to add edX to your whitelist of authorized SAML service providers.
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

export default SSOConfigServiceProviderStep;
