import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@openedx/paragon';
import { Timelapse } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import { ASSIGNMENT_ENROLLMENT_DEADLINE, useAssignmentStatusChip } from '../data';
import EVENT_NAMES from '../../../eventTracking';

const WaitingForLearner = ({ learnerEmail, trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_WAITING_FOR_LEARNER,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_WAITING_FOR_LEARNER_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useAssignmentStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_WAITING_FOR_LEARNER,
    chipHelpCenterEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_WAITING_FOR_LEARNER_HELP_CENTER,
    trackEvent,
  });

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Timelapse}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        tabIndex={0}
      >
        Waiting for learner
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={Timelapse} iconClassName="text-warning">
          Waiting for {learnerEmail ?? 'learner'}
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            This learner must create an edX account and complete enrollment in the course before the
            enrollment deadline or within {ASSIGNMENT_ENROLLMENT_DEADLINE} days of assignment, whichever
            is sooner.
          </p>
          <div className="micro">
            <p className="h6">Need help?</p>
            <p className="text-gray">
              Learn more about learner enrollment in assigned courses at{' '}
              <Hyperlink
                destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
                onClick={helpCenterTrackEvent}
                target="_blank"
              >
                Help Center: Course Assignments
              </Hyperlink>.
            </p>
          </div>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

WaitingForLearner.propTypes = {
  learnerEmail: PropTypes.string,
  trackEvent: PropTypes.func.isRequired,
};

export default WaitingForLearner;
