import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, useToggle } from '@edx/paragon';
import { Send } from '@edx/paragon/icons';
import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';

const NotifyingLearner = ({ learnerEmail, trackEvent }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const { BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_NOTIFY_LEARNER } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;
  const openChipModal = () => {
    open();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_NOTIFY_LEARNER, { isOpen: !isOpen });
  };

  const closeChipModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_NOTIFY_LEARNER, { isOpen: !isOpen });
  };

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
        isOpen={isOpen}
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
