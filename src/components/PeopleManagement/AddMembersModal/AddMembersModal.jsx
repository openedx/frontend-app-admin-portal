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
import LmsApiService from '../../../data/services/LmsApiService';
import SystemErrorAlertModal from '../../learner-credit-management/cards/assignment-allocation-status-modals/SystemErrorAlertModal';
import AddMembersModalContent from './AddMembersModalContent';
import { learnerCreditManagementQueryKeys } from '../../learner-credit-management/data';
import { useAllEnterpriseGroupLearners } from '../data/hooks';

const AddMembersModal = ({
  isModalOpen,
  closeModal,
  enterpriseUUID,
  groupName,
  groupUuid,
}) => {
  const intl = useIntl();
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [addButtonState, setAddButtonState] = useState('default');
  const [canAddMembers, setCanAddMembersGroup] = useState(false);
  const [isSystemErrorModalOpen, openSystemErrorModal, closeSystemErrorModal] = useToggle(false);
  const handleCloseAddMembersModal = () => {
    closeModal();
    setAddButtonState('default');
  };
  const queryClient = useQueryClient();
  const {
    isLoading,
    enterpriseGroupLearners,
  } = useAllEnterpriseGroupLearners(groupUuid);

  const handleAddMembers = async () => {
    setAddButtonState('pending');
    try {
      const requestBody = snakeCaseObject({
        learnerEmails,
      });
      await LmsApiService.inviteEnterpriseLearnersToGroup(groupUuid, requestBody);
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.group(groupUuid),
      });
      setAddButtonState('complete');
      handleCloseAddMembersModal();
    } catch (err) {
      logError(err);
      setAddButtonState('error');
      openSystemErrorModal();
    }
  };

  const handleEmailAddressesChange = useCallback((
    value,
    { canInvite = false } = {},
  ) => {
    setLearnerEmails(value);
    setCanAddMembersGroup(canInvite);
  }, []);

  useEffect(() => {
    setCanAddMembersGroup(false);
    if (canAddMembers) {
      setCanAddMembersGroup(true);
    }
  }, [canAddMembers]);
  return (
    <div>
      {!isLoading ? (
        <div>
          <FullscreenModal
            className="stepper-modal bg-light-200"
            isOpen={isModalOpen}
            onClose={handleCloseAddMembersModal}
            title={intl.formatMessage({
              id: 'peopleManagement.tab.add.members.modal.title',
              defaultMessage: 'Add members',
              description: 'Title for adding members modal',
            })}
            footerNode={(
              <ActionRow>
                <ActionRow.Spacer />
                <Button variant="tertiary" onClick={handleCloseAddMembersModal}>Cancel</Button>
                <StatefulButton
                  labels={{
                    default: 'Add',
                    pending: 'Adding...',
                    complete: 'Added',
                    error: 'Try again',
                  }}
                  variant="primary"
                  state={addButtonState}
                  disabled={!canAddMembers}
                  onClick={handleAddMembers}
                />
              </ActionRow>
            )}
          >
            <AddMembersModalContent
              groupName={groupName}
              onEmailAddressesChange={handleEmailAddressesChange}
              isGroupInvite
              enterpriseUUID={enterpriseUUID}
              enterpriseGroupLearners={enterpriseGroupLearners}
            />
          </FullscreenModal>
          <SystemErrorAlertModal
            isErrorModalOpen={isSystemErrorModalOpen}
            closeErrorModal={closeSystemErrorModal}
            closeAssignmentModal={handleCloseAddMembersModal}
            retry={handleAddMembers}
          />
        </div>
      ) : null}
    </div>
  );
};

AddMembersModal.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
  groupName: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AddMembersModal);
