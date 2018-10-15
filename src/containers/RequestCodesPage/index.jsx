import { connect } from 'react-redux';

import RequestCodesPage from '../../components/RequestCodesPage';

import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  emailAddress: state.authentication.email,
});

const mapDispatchToProps = dispatch => ({
  fetchPortalConfiguration: (slug) => {
    dispatch(fetchPortalConfiguration(slug));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestCodesPage);
