import { connect } from 'react-redux';
import EnterpriseList from '../../components/EnterpriseList';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';
import { getLocalUser } from '../../data/actions/authentication';
import searchEnterpriseList from '../../data/actions/enterpriseList';
import { paginateTable } from '../../data/actions/table';
import LmsApiService from '../../data/services/LmsApiService';

const tableId = 'enterprise-list';
const mapStateToProps = (state) => {
  const tableState = state.table[tableId] || {};

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
  getLocalUser: () => {
    dispatch(getLocalUser());
  },
  fetchEnterpriseList: () => {
    dispatch(paginateTable(tableId, LmsApiService.fetchEnterpriseList));
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
