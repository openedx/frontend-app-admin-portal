import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import LearnerActivityTable from '../../components/LearnerActivityTable';
import { clearTable } from '../../data/actions/table';

const mapDispatchToProps = dispatch => ({
  clearTable: (tableId) => {
    dispatch(clearTable(tableId));
  },
});

export default withRouter(connect(null, mapDispatchToProps)(LearnerActivityTable));
