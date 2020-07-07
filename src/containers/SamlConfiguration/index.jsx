import { connect } from 'react-redux';

import SamlConfiguration from '../../components/SamlConfiguration';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SamlConfiguration);
