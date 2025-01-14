import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  ActionRow, Button, ModalDialog, useToggle,
} from '@openedx/paragon';
import { RemoveCircleOutline } from '@openedx/paragon/icons';

import GeneralErrorModal from '../GeneralErrorModal';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';

import LmsApiService from '../../../data/services/LmsApiService';

const DeleteGroupModal = ({
  group, isOpen, close,
}) => {
  const { enterpriseSlug } = useParams();
  const [isErrorOpen, openError, closeError] = useToggle(false);
  const removeEnterpriseGroup = async () => {
    try {
      await LmsApiService.removeEnterpriseGroup(group?.uuid);
      close();
      const param = {
        toast: true,
      };
      const urlParams = new URLSearchParams(param);
      // redirect back to the people management page
      window.location.href = `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/?${urlParams.toString()}`;
    } catch (error) {
      logError(error);
      openError();
    }
  };
  return (
    <>
      <GeneralErrorModal
        isOpen={isErrorOpen}
        close={closeError}
      />
      <ModalDialog
        title="Delete group"
        isOpen={isOpen}
        onClose={close}
        hasCloseButton
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Delete group?</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p className="pb-3">
            <FormattedMessage
              id="people.management.delete.group.modal.body.1"
              defaultMessage="This action cannot be undone."
              description="Warning shown when deleting a group."
            />
          </p>
          <FormattedMessage
            id="people.management.delete.group.modal.body.2"
            defaultMessage={
            'By deleting this group you will no longer be able to track analytics associated'
            + ' with this group and the group will be removed from your People Management page.'
          }
            description="Warning shown when deleting a group part 2."
          />
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              Go back
            </ModalDialog.CloseButton>
            <Button variant="danger" data-testid="delete-group-button" onClick={removeEnterpriseGroup} iconBefore={RemoveCircleOutline}>
              Delete group
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

DeleteGroupModal.propTypes = {
  group: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default DeleteGroupModal;
