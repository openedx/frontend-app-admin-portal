import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useStatusChip } from '../data';

const FailedSystem = ({ trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_SYSTEM,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_SYSTEM_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_SYSTEM,
    chipHelpCenterEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_SYSTEM_HELP_CENTER,
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
        Failed: System
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
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

FailedSystem.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default FailedSystem;
