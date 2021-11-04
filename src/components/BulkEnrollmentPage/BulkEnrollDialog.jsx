import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, Button, FullscreenModal } from '@edx/paragon';

const BulkEnrollDialog = ({ subscription, isOpen, onClose }) => (
  <FullscreenModal
    hasCloseButton={false}
    title={`Subscription Enrollment for ${subscription.title}`}
    isOpen={isOpen}
    onClose={onClose}
    footerNode={(
      <ActionRow>
        <p className="x-small text-muted">
          Notes
        </p>
        <ActionRow.Spacer />
        <Button variant="tertiary" onClick={onClose}>Cancel</Button>
        <Button>Submit</Button>
      </ActionRow>
        )}
  >
    <p>
      Bulk Enroll Initiated!
    </p>
  </FullscreenModal>
);

BulkEnrollDialog.propTypes = {
  subscription: PropTypes.shape({ title: PropTypes.string.isRequired }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEnrollDialog;
