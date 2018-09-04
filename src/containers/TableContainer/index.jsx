import { connect } from 'react-redux';

import TableWithPagination from '../../components/TableWithPagination';
import { paginateTable, sortTable } from '../../data/actions/table';

const tableId = 'course-enrollments';

const mapStateToProps = state => ({
  data: state.table[tableId].data,
  loading: state.table[tableId].loading,
  error: state.table[tableId].error,
  tableId,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  paginateTable: (options) => {
    dispatch(paginateTable(ownProps.id, ownProps.fetchMethod, options));
  },
  sortTable: (options) => {
    dispatch(sortTable(ownProps.id, ownProps.fetchMethod, options));
  },
});

// TODO: proptypes for ownProps?

const TableContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableWithPagination);

export default TableContainer;
