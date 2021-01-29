import { connect } from 'react-redux';
import { reset } from 'redux-form';

import BulkEnrollmentModal from '../../components/BulkEnrollmentModal';

import sendBulkEnrollment from '../../data/actions/bulkEnrollment';

const mapDispatchToProps = dispatch => ({
  sendBulkEnrollment: (enterpriseUuid, options) => new Promise((resolve, reject) => {
    dispatch(sendBulkEnrollment({
      enterpriseUuid,
      options,
      onSuccess: (response) => {
        resolve(response);
        dispatch(reset('bulk-enrollment-modal-form'));
      },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(BulkEnrollmentModal);
