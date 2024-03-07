import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Hyperlink,
  StatefulButton,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';

import InviteModalContent from './InviteModalContent';
import CreateInvitationErrorAlertModals from './CreateInvitationErrorAlertModals';

const InviteMembersModalWrapper = ({ isOpen, close }) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  const [inviteButtonState, setInviteButtonState] = useState('default');
  const [createInvitationErrorReason, setCreateInvitationErrorReason] = useState();
  // const {
  //   successfulInvitationToast: { displayToastForAssignmentAllocation },
  // } = useContext(BudgetDetailPageContext);

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

  const handleInviteMembers = () => {
    setInviteButtonState('pending');
    // on success
    // setInviteButtonState('complete');
    // handleCloseInviteModal();
    // displayToastForAssignmentAllocation({
    //   totalLearnersAllocated,
    //   totalLearnersAlreadyAllocated,
    // });

    // on error
    // setInviteButtonState('error');
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
              destination={getConfig().ENTERPRISE_SUPPORT_URL}
              showLaunchIcon
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
        />
      </FullscreenModal>
      <CreateInvitationErrorAlertModals
        errorReason={createInvitationErrorReason}
        retry={handleInviteMembers}
        closeInvitationModal={handleCloseInviteModal}
      />
    </>
  );
};

InviteMembersModalWrapper.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  open: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired, // Represents the button text
};

export default InviteMembersModalWrapper;
