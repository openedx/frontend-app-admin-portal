import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';
import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useStatusChip } from '../data';

const FailedReminder = ({ trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER,
    chipHelpCenterEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER_HELP_CENTER,
    trackEvent,
  });

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Error}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        tabIndex={0}
      >
        Failed: Reminder
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Reminder
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>Your reminder email did not send. Something went wrong behind the scenes.</p>
          <div className="micro">
            <p className="h6">Suggested resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Wait and try to send this reminder again later, or send an email directly outside of the system.
              </li>
              <li>
                If the issue continues, contact customer support.
              </li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink
                  destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
                  onClick={helpCenterTrackEvent}
                  target="_blank"
                >
                  Help Center: Course Assignments
                </Hyperlink>.
              </li>
            </ul>
          </div>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

FailedReminder.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default FailedReminder;
