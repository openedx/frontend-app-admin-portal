import React, { useState } from 'react';
import { Chip, useToggle, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';

const FailedCancellation = () => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  return (
    <>
      <Chip
        disabled={false}
        iconBefore={Error}
        onClick={open}
        onKeyPress={open}
        ref={setTarget}
        tabIndex={0}
        variant="light"
      >
        Failed: Cancellation
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Cancellation
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>This assignment was not canceled. Something went wrong behind the scenes.</p>
          <div className="micro">
            <p className="h6">Suggested resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Wait and try to cancel this assignment again later
              </li>
              <li>
                If the issue continues, contact customer support.
              </li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
                  Help Center: Course Assignments
                </Hyperlink>
              </li>
            </ul>
          </div>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

export default FailedCancellation;
