import React, { useState } from 'react';
import { Chip, useToggle, Hyperlink } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import BaseModalPopup from './BaseModalPopup';

const FailedReminder = () => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Error}
        onClick={open}
        onKeyPress={open}
        tabIndex={0}
      >
        Failed: Reminder
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
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
                <Hyperlink destination="https://edx.org" target="_blank">
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

export default FailedReminder;
