import React, { useCallback, useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import {
  ActionRow, Button, FullscreenModal, StatefulButton, useToggle,
} from '@openedx/paragon';
import LmsApiService from '../../data/services/LmsApiService';
import SystemErrorAlertModal from '../learner-credit-management/cards/assignment-allocation-status-modals/SystemErrorAlertModal';
import CreateGroupModalContent from './CreateGroupModalContent';
import { learnerCreditManagementQueryKeys } from '../learner-credit-management/data';

const CreateGroupModal = ({
  isModalOpen,
  closeModal,
  enterpriseUUID,
}) => {
  const intl = useIntl();
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [createButtonState, setCreateButtonState] = useState('default');
  const [groupName, setGroupName] = useState('');
  const [canCreateGroup, setCanCreateGroup] = useState(false);
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  const [isSystemErrorModalOpen, openSystemErrorModal, closeSystemErrorModal] = useToggle(false);
  const handleCloseCreateGroupModal = () => {
    closeModal();
    setCreateButtonState('default');
  };
  const queryClient = useQueryClient();

  const handleCreateGroup = async () => {
    setCreateButtonState('pending');
    const options = {
      enterpriseUUID,
      groupName,
    };
    let groupCreationResponse;

    try {
      groupCreationResponse = await LmsApiService.createEnterpriseGroup(options);
    } catch (err) {
      logError(err);
      setCreateButtonState('error');
      openSystemErrorModal();
    }

    try {
      const requestBody = snakeCaseObject({
        learnerEmails,
      });
      await LmsApiService.inviteEnterpriseLearnersToGroup(groupCreationResponse.data.uuid, requestBody);
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.group(enterpriseUUID),
      });
      setCreateButtonState('complete');
      handleCloseCreateGroupModal();
    } catch (err) {
      logError(err);
      setCreateButtonState('error');
      openSystemErrorModal();
    }
  };

  const handleEmailAddressesChange = useCallback((
    value,
    { canInvite = false } = {},
  ) => {
    setLearnerEmails(value);
    setCanInviteMembers(canInvite);
  }, []);

  useEffect(() => {
    setCanCreateGroup(false);
    if (groupName.length > 0 && canInviteMembers) {
      setCanCreateGroup(true);
    }
  }, [groupName, canInviteMembers]);

  return (
    <>
      <FullscreenModal
        className="stepper-modal bg-light-200"
        isOpen={isModalOpen}
        onClose={handleCloseCreateGroupModal}
        title={intl.formatMessage({
          id: 'peopleManagement.tab.create.group.modal.title',
          defaultMessage: 'New group',
          description: 'Title for creating a new group modal',
        })}
        footerNode={(
          <ActionRow>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={handleCloseCreateGroupModal}>Cancel</Button>
            <StatefulButton
              labels={{
                default: 'Create',
                pending: 'Creating...',
                complete: 'Created',
                error: 'Try again',
              }}
              variant="primary"
              state={createButtonState}
              disabled={!canCreateGroup}
              onClick={handleCreateGroup}
            />
          </ActionRow>
        )}
      >
        <CreateGroupModalContent
          onSetGroupName={setGroupName}
          onEmailAddressesChange={handleEmailAddressesChange}
          isGroupInvite
          enterpriseUUID={enterpriseUUID}
        />
      </FullscreenModal>
      <SystemErrorAlertModal
        isErrorModalOpen={isSystemErrorModalOpen}
        closeErrorModal={closeSystemErrorModal}
        closeAssignmentModal={handleCloseCreateGroupModal}
        retry={handleCreateGroup}
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

CreateGroupModal.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(CreateGroupModal);
