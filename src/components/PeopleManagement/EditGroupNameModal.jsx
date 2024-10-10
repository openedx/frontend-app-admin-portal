import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, ModalDialog, Spinner, StatefulButton, useToggle,
} from '@openedx/paragon';

import MAX_LENGTH_GROUP_NAME from './constants';
import LmsApiService from '../../data/services/LmsApiService';
import GeneralErrorModal from './GeneralErrorModal';

const EditGroupNameModal = ({
  group, isOpen, close, setShowToast, setToastMessage, forceUpdate,
}) => {
  const intl = useIntl();
  const [isErrorOpen, openError, closeError] = useToggle(false);
  const [name, setName] = useState(group.name);
  const [nameLength, setNameLength] = useState(group.name.length || 0);
  const [buttonState, setButtonState] = useState('default');

  const handleGroupNameChange = (e) => {
    if (!e.target.value) {
      setName('');
      return;
    }
    if (e.target.value?.length > MAX_LENGTH_GROUP_NAME) {
      return;
    }
    setNameLength(e.target.value?.length);
    setName(e.target.value);
  };

  const editEnterpriseGroup = async () => {
    setButtonState('pending');
    try {
      const formData = { name };
      const response = await LmsApiService.updateEnterpriseGroup(group.uuid, formData);
      if (response.status === 200) {
        setButtonState('complete');
        close();
        setShowToast(true);
        setToastMessage('Group name updated');
        forceUpdate();
      }
    } catch (error) {
      openError();
    }
    setButtonState('default');
  };

  return (
    <>
      <GeneralErrorModal isOpen={isErrorOpen} close={closeError} />
      <ModalDialog
        title="Edit group"
        isOpen={isOpen}
        onClose={close}
        hasCloseButton
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Edit group name</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Form.Control
            value={name}
            onChange={handleGroupNameChange}
            label="name-your-group"
            data-testid="group name input"
            placeholder="Name"
          />
          <Form.Control.Feedback>
            {nameLength} / {MAX_LENGTH_GROUP_NAME}
          </Form.Control.Feedback>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              Cancel
            </ModalDialog.CloseButton>
            <StatefulButton
              state={buttonState}
              labels={{
                default: intl.formatMessage({
                  id: 'adminPortal.peopleManagement.editGroupNameModal.button.save',
                  defaultMessage: 'Save',
                  description:
                    'Label for the download button in the module activity report page.',
                }),
                pending: intl.formatMessage({
                  id: 'adminPortal.peopleManagement.editGroupNameModal.button.pending',
                  defaultMessage: 'Saving',
                  description:
                    'Label for the download button in the module activity report page when the download is in progress.',
                }),
                complete: intl.formatMessage({
                  id: 'adminPortal.peopleManagement.editGroupNameModal.button.complete',
                  defaultMessage: 'Saved',
                  description:
                    'Label for the download button in the module activity report page when the download is complete.',
                }),
              }}
              icons={{
                pending: (
                  <Spinner animation="border" variant="light" size="sm" />
                ),
              }}
              disabledStates={['pending']}
              onClick={editEnterpriseGroup}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

EditGroupNameModal.propTypes = {
  group: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setShowToast: PropTypes.func.isRequired,
  setToastMessage: PropTypes.func.isRequired,
  forceUpdate: PropTypes.func.isRequired,
};

export default EditGroupNameModal;
