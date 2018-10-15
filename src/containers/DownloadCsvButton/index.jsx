import { connect } from 'react-redux';

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

export default connect(mapStateToProps, mapDispatchToProps)(DownloadCsvButton);
