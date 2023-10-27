import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, useToggle } from '@edx/paragon';
import { Send } from '@edx/paragon/icons';
import BaseModalPopup from './BaseModalPopup';

const NotifyingLearner = ({ learnerEmail }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Send}
        onClick={open}
        onKeyPress={open}
        tabIndex={0}
      >
        Notifying learner
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <BaseModalPopup.Heading icon={Send} iconClassName="text-gray-300">
          Notifying {learnerEmail ?? 'learner'}
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            Our system is busy emailing {learnerEmail ?? 'the learner'}! Refresh in a few minutes to
            confirm the assignment notification was successful.
          </p>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

NotifyingLearner.propTypes = {
  learnerEmail: PropTypes.string,
};

export default NotifyingLearner;
