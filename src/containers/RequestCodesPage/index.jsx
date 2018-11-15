import { connect } from 'react-redux';

import RequestCodesPage from '../../components/RequestCodesPage';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  emailAddress: state.authentication.email,
});

export default connect(mapStateToProps)(RequestCodesPage);
