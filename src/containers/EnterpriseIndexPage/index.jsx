import { connect } from 'react-redux';
import EnterpriseList from '../../components/EnterpriseList';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapDispatchToProps = dispatch => ({
  clearPortalConfiguration: () => {
    dispatch(clearPortalConfiguration());
  },
});

const EnterpriseIndexPage = connect(
  null,
  mapDispatchToProps,
)(EnterpriseList);

export default EnterpriseIndexPage;
