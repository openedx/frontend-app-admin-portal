import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useExistingSSOConfigs } from '../hooks';
import SSOConfigCard from '../SSOConfigCard';

const SSOConfigConnectStep = ({ enterpriseId }) => {
  // When we render this cmponent, we need to re-fetch provider configs and updatee the store
  // so that we can correctly show latest state of providers
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId);
  return (
    <>
      {isLoading && <span>Loading SSO Configurations...</span>}
      {!isLoading && existingConfigs && existingConfigs.length > 0 && (
        <>
          <p>
            Lastly, let us test your configuration. Click on a card below to connect to edX via your SSO.
          </p>
          <div className="d-flex">
            {existingConfigs.map(config => <SSOConfigCard config={config} />)}
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
