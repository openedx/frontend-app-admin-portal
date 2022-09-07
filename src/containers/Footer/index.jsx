import { connect } from 'react-redux';

import Footer from '../../components/Footer';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseBranding?.logo,
});

export default connect(mapStateToProps)(Footer);
