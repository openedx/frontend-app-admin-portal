import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@openedx/paragon';
import { Send } from '@openedx/paragon/icons';
import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useAssignmentStatusChip } from '../data';

const NotifyingLearner = ({ learnerEmail, trackEvent }) => {
  const [target, setTarget] = useState(null);
  const { BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_NOTIFY_LEARNER } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
  } = useAssignmentStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_NOTIFY_LEARNER,
    trackEvent,
  });

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Send}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        tabIndex={0}
      >
        Notifying learner
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={Send} iconClassName="text-gray-300">
          Notifying {learnerEmail ?? 'learner'}
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            Our system is busy emailing {learnerEmail ?? 'the learner'}! Refresh in a few minutes to
            confirm the assignment notification was successful.
          </p>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

NotifyingLearner.propTypes = {
  learnerEmail: PropTypes.string,
  trackEvent: PropTypes.func.isRequired,
};

export default NotifyingLearner;
