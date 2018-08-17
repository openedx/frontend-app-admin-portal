import { connect } from 'react-redux';
import EnterpriseList from '../../components/EnterpriseList';
import { fetchEnterpriseList, setEnterpriseListSearchQuery } from '../../data/actions/enterpriseList';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';
import { getLocalUser } from '../../data/actions/authentication';

const mapStateToProps = state => ({
  searchQuery: state.enterpriseList.searchQuery,
  loading: state.enterpriseList.loading,
  error: state.enterpriseList.error,
  enterprises: state.enterpriseList.enterprises,
});

const mapDispatchToProps = dispatch => ({
  getEnterpriseList: (options) => {
    dispatch(fetchEnterpriseList(options));
  },
  clearPortalConfiguration: () => {
    dispatch(clearPortalConfiguration());
  },
  getLocalUser: () => {
    dispatch(getLocalUser());
  },
  setSearchQuery: (query) => {
    dispatch(setEnterpriseListSearchQuery(query));
  },
});

const EnterpriseIndexPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterpriseList);

export default EnterpriseIndexPage;
