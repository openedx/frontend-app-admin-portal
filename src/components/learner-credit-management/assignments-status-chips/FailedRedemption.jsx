import React, { useState } from 'react';
import { Chip, Hyperlink, useToggle } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';

const FailedRedemption = () => {
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
        Failed: Redemption
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Redemption
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            Something went wrong behind the scenes when the learner attempted to redeem this course assignment.
            Associated Learner credit funds have been released into your available balance.
          </p>
          <div className="micro">
            <p className="h6">Resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Try assigning this content to the learner again.
              </li>
              <li>
                If the issue continues, contact customer support.
              </li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
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

export default FailedRedemption;
