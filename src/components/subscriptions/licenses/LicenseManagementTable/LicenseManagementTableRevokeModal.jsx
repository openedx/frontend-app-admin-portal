import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Icon, ModalDialog, ActionRow
} from '@edx/paragon';
import { 
  Email,
  RemoveCircle 
} from '@edx/paragon/icons';

const LicenseManagementRevokeModal = ({isOpen, onClose}) =>{
  const numberRevoked=0;
  const title = `Revoke License${numberRevoked > 1 ? 's':''}`
  return(
    <ModalDialog
      title={title}
      isOpen = {isOpen}
      onClose={onClose}

    >
        <ModalDialog.Header>
          <ModalDialog.Title>
            Revoke Licenses
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>This action cannot be undone. Learners with revoked licenses must be reinvited. </p>
          <p>Learn more about revoking subscription licenses.</p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              Cancel
            </ModalDialog.CloseButton>
            <Button variant="danger" iconBefore={RemoveCircle}>Revoke({numberRevoked})</Button>
          </ActionRow>
        </ModalDialog.Footer>
    </ModalDialog>
  )
}

export default LicenseManagementRevokeModal;