import React, { useState } from 'react';
import { Chip, Hyperlink, useToggle } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import BaseModalPopup from './BaseModalPopup';

const FailedSystem = () => {
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
        Failed: System
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: System
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>Something went wrong behind the scenes.</p>
          <div className="micro">
            <p className="h6">Resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Cancel this assignment to release the associated Learner Credit funds into your available balance.
              </li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink destination="https://edx.org" showLaunchIcon target="_blank">
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

export default FailedSystem;
