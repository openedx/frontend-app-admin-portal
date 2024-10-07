import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, FullscreenModal, Hyperlink, StatefulButton, useToggle,
} from '@openedx/paragon';
import { snakeCaseObject } from '@edx/frontend-platform/utils';

import { useBudgetId, useSubsidyAccessPolicy } from '../data';
import InviteModalContent from './InviteModalContent';
import SystemErrorAlertModal from '../cards/assignment-allocation-status-modals/SystemErrorAlertModal';
import LmsApiService from '../../../data/services/LmsApiService';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import { BUDGET_DETAIL_MEMBERS_TAB } from '../data/constants';
import { HELP_CENTER_GROUPS_INVITE_LINK } from '../../settings/data/constants';

const InviteMembersModalWrapper = ({
  isOpen,
  close,
  handleTabSelect,
  setRefresh,
  refresh,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  const [inviteButtonState, setInviteButtonState] = useState('default');
  const [isSystemErrorModalOpen, openSystemErrorModal, closeSystemErrorModal] = useToggle(false);
  const {
    successfulInvitationToast: { displayToastForInvitation },
  } = useContext(BudgetDetailPageContext);

  const handleCloseInviteModal = () => {
    close();
    setInviteButtonState('default');
  };

  // Callback function for when emails are changed in the
  // child AssignmentModalContent component. Must be memoized as
  // the function is used within a `useEffect`'s dependency array.
  const handleEmailAddressesChanged = useCallback((
    value,
    { canInvite = false } = {},
  ) => {
    setLearnerEmails(value);
    setCanInviteMembers(canInvite);
  }, []);

  const handleInviteMembers = async () => {
    setInviteButtonState('pending');
    const requestBody = snakeCaseObject({
      learnerEmails,
      catalogUuid: subsidyAccessPolicy.catalogUuid,
      actByDate: subsidyAccessPolicy.subsidyExpirationDatetime,
    });

    try {
      if (subsidyAccessPolicy.groupAssociations.length > 0) {
        const groupUuid = subsidyAccessPolicy.groupAssociations[0];
        const response = await LmsApiService.inviteEnterpriseLearnersToGroup(groupUuid, requestBody);
        const totalLearnersInvited = response.data.records_processed;
        setInviteButtonState('complete');
        handleCloseInviteModal();
        displayToastForInvitation({
          totalLearnersInvited,
        });
        setRefresh(!refresh);
        handleTabSelect(BUDGET_DETAIL_MEMBERS_TAB);
      } else {
        setInviteButtonState('error');
        openSystemErrorModal();
      }
    } catch (err) {
      setInviteButtonState('error');
      openSystemErrorModal();
    }
  };

  return (
    <>
      <FullscreenModal
        className="stepper-modal bg-light-200"
        title="New members"
        isOpen={isOpen}
        onClose={() => {
          handleCloseInviteModal();
        }}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              as={Hyperlink}
              destination={HELP_CENTER_GROUPS_INVITE_LINK}
              target="_blank"
            >
              Help Center: Invite Budget Members
            </Button>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={handleCloseInviteModal}>Cancel</Button>
            <StatefulButton
              labels={{
                default: 'Invite',
                pending: 'Inviting...',
                complete: 'Invited',
                error: 'Try again',
              }}
              variant="primary"
              state={inviteButtonState}
              disabled={!canInviteMembers}
              onClick={handleInviteMembers}
            />
          </ActionRow>
        )}
      >
        <InviteModalContent
          onEmailAddressesChange={handleEmailAddressesChanged}
          subsidyAccessPolicy={subsidyAccessPolicy}
          isGroupInvite={false}
        />
      </FullscreenModal>
      <SystemErrorAlertModal
        isErrorModalOpen={isSystemErrorModalOpen}
        closeErrorModal={closeSystemErrorModal}
        closeAssignmentModal={handleCloseInviteModal}
        retry={handleInviteMembers}
      />
    </>
  );
};

InviteMembersModalWrapper.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  handleTabSelect: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  refresh: PropTypes.bool.isRequired,
};

export default InviteMembersModalWrapper;
