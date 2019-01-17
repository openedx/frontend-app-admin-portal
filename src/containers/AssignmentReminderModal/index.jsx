import { connect } from 'react-redux';

import AssignmentReminderModal from '../../components/AssignmentReminderModal';

import sendAssignmentReminder from '../../data/actions/assignmentReminder';

const mapDispatchToProps = dispatch => ({
  sendAssignmentReminder: (couponId, options) => new Promise((resolve, reject) => {
    dispatch(sendAssignmentReminder({
      couponId,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(AssignmentReminderModal);
