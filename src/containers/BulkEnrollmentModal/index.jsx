import { connect } from 'react-redux';

import BulkEnrollmentModal from '../../components/BulkEnrollmentModal';

import sendBulkEnrollment from '../../data/actions/bulkEnrollment';

const mapDispatchToProps = dispatch => ({
  sendBulkEnrollment: (enterpriseUuid, options) => new Promise((resolve, reject) => {
    dispatch(sendBulkEnrollment({
      enterpriseUuid,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(BulkEnrollmentModal);
