import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { fetchCsv, clearCsv } from '../../data/actions/csv';
import DownloadCsvButton from '../../components/DownloadCsvButton';

const mapStateToProps = (state, ownProps) => {
  const csvState = state.csv[ownProps.id] || {};
  return {
    csvLoading: csvState.csvLoading,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchCsv: (fetchMethod) => {
    dispatch(fetchCsv(ownProps.id, fetchMethod));
  },
  clearCsv: () => {
    dispatch(clearCsv(ownProps.id));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DownloadCsvButton));
