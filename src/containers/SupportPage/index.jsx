import { connect } from 'react-redux';

import SupportPage from '../../components/SupportPage';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  emailAddress: state.userAccount.email,
});

export default connect(mapStateToProps)(SupportPage);
