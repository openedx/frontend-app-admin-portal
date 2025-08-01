import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from '../assignments-status-chips/BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useStatusChip } from '../data';

const FailedRedemption = ({ trackEvent }) => {
  const [target, setTarget] = useState(null);

  const {
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_REDEMPTION,
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_REDEMPTION_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_REDEMPTION,
    chipHelpCenterEventName: BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_REDEMPTION_HELP_CENTER,
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
        variant="dark"
      >
        Failed: Redemption
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
        withPortal
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Redemption
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            Something went wrong behind the scenes when the learner attempted to redeem the requested course.
            Associated Learner credit funds have been released into your available balance.
          </p>
          <div className="micro">
            <p className="h6">Resolution steps</p>
            <ul className="text-gray pl-3">
              <li>
                Confirm that the learner is not registered for this course before they request the course again.
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
                  Help Center
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
