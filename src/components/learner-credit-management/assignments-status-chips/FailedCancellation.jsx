import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, useToggle, Hyperlink } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';

const FailedCancellation = ({ trackEvent }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_CANCELLATION,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_CANCELLATION_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;
  const openChipModal = () => {
    open();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_CANCELLATION, { isOpen: !isOpen });
  };

  const closeChipModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_CANCELLATION, { isOpen: !isOpen });
  };

  const helpCenterTrackEvent = () => {
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_CANCELLATION_HELP_CENTER);
  };

  return (
    <>
      <Chip
        disabled={false}
        iconBefore={Error}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        ref={setTarget}
        tabIndex={0}
        variant="light"
      >
        Failed: Cancellation
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={closeChipModal}
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
                <Hyperlink
                  destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
                  onClick={helpCenterTrackEvent}
                  target="_blank"
                >
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

FailedCancellation.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default FailedCancellation;
