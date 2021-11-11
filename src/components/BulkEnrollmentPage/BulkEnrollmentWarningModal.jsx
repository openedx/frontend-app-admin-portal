import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  ActionRow, AlertModal, Button, Icon,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import BulkEnrollButton from './BulkEnrollButton';

const BulkEnrollWarningModal = ({
  learners, isDialogOpen, onClose, onEnroll,
}) => (
  <AlertModal
    title={(
      <>
        <Icon className={classNames('enroll-header', 'mr-1')} src={Error} />Revoked Learners Selected
      </>
      )}
    isOpen={isDialogOpen}
    footerNode={(
      <ActionRow>
        <Button variant="link" onClick={onClose}>Close</Button>
        <BulkEnrollButton
          learners={learners}
          handleEnrollment={onEnroll}
          buttonType="ENROLL_BTN_IN_WARNING_MODAL"
        />
      </ActionRow>
    )}
  >
    Any learners with revoked licenses are not included. Click &quot;Enroll&quot; to enroll
    active and pending learners only
  </AlertModal>
);

BulkEnrollWarningModal.defaultProps = {
  learners: [],
  isDialogOpen: false,
};

BulkEnrollWarningModal.propTypes = {
  isDialogOpen: PropTypes.bool,
  learners: PropTypes.arrayOf(PropTypes.shape({})),
  onEnroll: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEnrollWarningModal;
