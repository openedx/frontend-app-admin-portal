import { connect } from 'react-redux';

import SamlProviderConfiguration from '../../components/SamlProviderConfiguration';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SamlProviderConfiguration);
