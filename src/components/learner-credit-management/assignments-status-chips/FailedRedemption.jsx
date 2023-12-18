import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Chip, Hyperlink, useToggle } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from './BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';

const FailedRedemption = ({ trackEvent }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REDEMPTION,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REDEMPTION_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const openChipModal = () => {
    open();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REDEMPTION, { isOpen: !isOpen });
  };

  const closeChipModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REDEMPTION, { isOpen: !isOpen });
  };

  const helpCenterTrackEvent = () => {
    trackEvent(BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_FAILED_REDEMPTION_HELP_CENTER);
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
        Failed: Redemption
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={closeChipModal}
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

FailedRedemption.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default FailedRedemption;
