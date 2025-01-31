import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, ModalDialog,
} from '@openedx/paragon';
import { RemoveCircle } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { useQueryClient } from '@tanstack/react-query';

import LmsApiService from '../../../data/services/LmsApiService';
import { peopleManagementQueryKeys } from '../constants';

const RemoveMemberModal = ({
  groupUuid, row, isOpen, close, openError, refresh, setRefresh,
}) => {
  const queryClient = useQueryClient();

  const removeEnterpriseGroupMember = async () => {
    try {
      const rowEmail = row.id;
      const formData = new FormData();
      formData.append('learner_emails', rowEmail);
      await LmsApiService.removeEnterpriseLearnersFromGroup(groupUuid, formData);
      queryClient.invalidateQueries({
        queryKey: peopleManagementQueryKeys.group(groupUuid),
      });
      setRefresh(!refresh);
      close();
    } catch (error) {
      close();
      logError(error);
      openError();
    }
  };
  return (
    <ModalDialog
      title="Remove member?"
      isOpen={isOpen}
      onClose={close}
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          Remove member?
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="peopleManagement.groupMember.delete.body.1"
            defaultMessage="This action cannot be undone."
            description="Warning shown when deleting a member from a group."
          />
        </p>
        <p>
          <FormattedMessage
            id="peopleManagement.groupMember.delete.body.2"
            defaultMessage="This member will no longer be included
              in the group’s progress report. Removal will not impact
              any current access this member has to Learner Credit budgets."
            description="Warning shown when deleting a member from a group."
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Go back
          </ModalDialog.CloseButton>
          <Button
            variant="danger"
            onClick={removeEnterpriseGroupMember}
            iconBefore={RemoveCircle}
            data-testid="remove-member-confirm"
          >Remove member
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

RemoveMemberModal.propTypes = {
  groupUuid: PropTypes.string.isRequired,
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  openError: PropTypes.func.isRequired,
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
};

export default RemoveMemberModal;
