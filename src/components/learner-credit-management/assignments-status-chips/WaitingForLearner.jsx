import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink, useToggle } from '@openedx/paragon';
import { Timelapse } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import { ASSIGNMENT_ENROLLMENT_DEADLINE } from '../data';

const WaitingForLearner = ({ learnerEmail }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Timelapse}
        onClick={open}
        onKeyPress={open}
        tabIndex={0}
      >
        Waiting for learner
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
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
              <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
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
};

export default WaitingForLearner;
