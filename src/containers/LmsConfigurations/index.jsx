import { connect } from 'react-redux';

import LmsConfigurations from '../../components/LmsConfigurations';

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(LmsConfigurations);
