import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink, useToggle } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';

const FailedBadEmail = ({ learnerEmail }) => {
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
        Failed: Bad email
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Bad email
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            This course assignment failed because a notification to {learnerEmail || 'the learner'} could not be sent.
          </p>
          <div className="micro">
            <p className="h6">Resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Cancel this assignment to release the associated Learner Credit funds into your available balance.
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

FailedBadEmail.propTypes = {
  learnerEmail: PropTypes.string,
};

FailedBadEmail.defaultProps = {
  learnerEmail: undefined,
};

export default FailedBadEmail;
