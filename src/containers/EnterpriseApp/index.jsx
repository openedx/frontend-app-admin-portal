import { connect } from 'react-redux';

import EnterpriseApp from '../../components/EnterpriseApp';

import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};

  return {
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchPortalConfiguration: (slug) => {
    dispatch(fetchPortalConfiguration(slug));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);
