import { connect } from 'react-redux';

import SamlConfiguration from '../../components/SamlConfiguration';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SamlConfiguration);
