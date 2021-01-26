import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EnterpriseList from '../../components/EnterpriseList';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';
import searchEnterpriseList from '../../data/actions/enterpriseList';

const mapStateToProps = (state) => {
  const tableState = state.table['enterprise-list'] || {};
  return {
    enterpriseList: tableState.data,
    loading: tableState.loading,
    error: tableState.error,
  };
};

const mapDispatchToProps = dispatch => ({
  clearPortalConfiguration: () => {
    dispatch(clearPortalConfiguration());
  },
  searchEnterpriseList: (options) => {
    dispatch(searchEnterpriseList(options));
  },
});

const EnterpriseIndexPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterpriseList);

export default EnterpriseIndexPage;
