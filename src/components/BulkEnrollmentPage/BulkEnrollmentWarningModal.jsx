import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  ActionRow, AlertModal, Button, Icon,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import BulkEnrollButton from './BulkEnrollButton';

const BulkEnrollWarningModal = ({
  learners = [], isDialogOpen = false, onClose, onEnroll,
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
        />
      </ActionRow>
    )}
  >
    <>
      {`Any learners with revoked licenses are not included. Click "Enroll" to enroll active
          and pending learners only`}
    </>
  </AlertModal>
);

BulkEnrollWarningModal.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
  learners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onEnroll: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEnrollWarningModal;
