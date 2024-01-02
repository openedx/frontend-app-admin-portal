import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useAssignmentStatusChip } from '../data';

const FailedBadEmail = ({ learnerEmail, trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_EMAIL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_EMAIL_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useAssignmentStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_EMAIL,
    chipHelpCenterEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_EMAIL_HELP_CENTER,
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
        Failed: Bad email
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
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

FailedBadEmail.propTypes = {
  learnerEmail: PropTypes.string,
  trackEvent: PropTypes.func.isRequired,
};

FailedBadEmail.defaultProps = {
  learnerEmail: undefined,
};

export default FailedBadEmail;
