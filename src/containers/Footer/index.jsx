import { connect } from 'react-redux';

import Footer from '../../components/Footer';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseBranding: state.portalConfiguration.enterpriseBranding,
});

export default connect(mapStateToProps)(Footer);
