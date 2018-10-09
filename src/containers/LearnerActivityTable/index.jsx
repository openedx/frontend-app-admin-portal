import { connect } from 'react-redux';

import LearnerActivityTable from '../../components/LearnerActivityTable';
import { clearTable } from '../../data/actions/table';

const mapDispatchToProps = dispatch => ({
  clearTable: (tableId) => {
    dispatch(clearTable(tableId));
  },
});

export default connect(null, mapDispatchToProps)(LearnerActivityTable);
