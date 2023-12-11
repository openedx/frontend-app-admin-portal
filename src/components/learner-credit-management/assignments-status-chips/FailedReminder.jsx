import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, useToggle, Hyperlink } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';
import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';

const FailedReminder = ({ trackEvent }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const openChipModal = () => {
    open();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER, { isOpen: !isOpen });
  };

  const closeChipModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER, { isOpen: !isOpen });
  };

  const helpCenterTrackEvent = () => {
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REMINDER_HELP_CENTER);
  };

  return (
    <>
      <Chip
        disabled={false}
        iconBefore={Error}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        ref={setTarget}
        tabIndex={0}
        variant="light"
      >
        Failed: Reminder
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
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
