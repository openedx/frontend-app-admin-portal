import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Chip, Hyperlink, useToggle } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import BaseModalPopup from './BaseModalPopup';

const FailedSystem = ({ trackEvent }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const openChipModal = () => {
    open();
    trackEvent();
  };

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Error}
        onClick={openChipModal}
        onKeyPress={openChipModal}
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

FailedSystem.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default FailedSystem;
