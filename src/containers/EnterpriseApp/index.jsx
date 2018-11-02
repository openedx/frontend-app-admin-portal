import { connect } from 'react-redux';

import EnterpriseApp from '../../components/EnterpriseApp';

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};

  return {
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
  };
};

export default connect(mapStateToProps)(EnterpriseApp);
