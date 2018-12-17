import { connect } from 'react-redux';

import CodeAssignmentModal from '../../components/CodeAssignmentModal';

import sendCodeAssignment from '../../data/actions/codeAssignment';

const mapStateToProps = state => ({
  loading: state.codeAssignment.loading,
  error: state.codeAssignment.error,
  codeAssignments: state.codeAssignment.data,
});

const mapDispatchToProps = dispatch => ({
  sendCodeAssignment: (formData) => {
    dispatch(sendCodeAssignment(formData));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeAssignmentModal);
