import React from 'react';
import PropTypes from 'prop-types';

import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const BulkEnrollmentButton = ({
  enterpriseUuid,
  onSuccess,
  onClose,
  selectedCourseRunKeys,
}) => (
  <ActionButtonWithModal
    buttonLabel="Enroll Learners"
    buttonClassName="remind-btn btn-sm p-0"
    variant="link"
    renderModal={({ closeModal }) => (
      <BulkEnrollmentModal
        enterpriseUuid={enterpriseUuid}
        selectedCourseRunKeys={selectedCourseRunKeys}
        title="Enroll Learners"
        onSuccess={onSuccess}
        onClose={() => {
          closeModal();
          if (onClose) {
            onClose();
          }
        }}
      />
    )}
  />
);

BulkEnrollmentButton.propTypes = {
  enterpriseUuid: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  selectedCourseRunKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

BulkEnrollmentButton.defaultProps = {
  onClose: null,
};

export default BulkEnrollmentButton;
