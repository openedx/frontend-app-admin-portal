import { connect } from 'react-redux';

import RequestCodesPage from '../../components/RequestCodesPage';

import { requestCodes, clearRequestCodes } from '../../data/actions/requestCodes';
import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  emailAddress: state.authentication.email,
  error: state.requestCodes.error,
  success: state.requestCodes.success,
});

const mapDispatchToProps = dispatch => ({
  fetchPortalConfiguration: (slug) => {
    dispatch(fetchPortalConfiguration(slug));
  },
  requestCodes: (options) => {
    dispatch(requestCodes(options));
  },
  clearRequestCodes: () => {
    dispatch(clearRequestCodes());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestCodesPage);
