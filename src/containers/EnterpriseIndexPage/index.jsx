import { connect } from 'react-redux';
import EnterpriseList from '../../components/EnterpriseList';
import fetchEnterpriseList from '../../data/actions/enterpriseList';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapStateToProps = state => ({
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
});

const EnterpriseIndexPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterpriseList);

export default EnterpriseIndexPage;
