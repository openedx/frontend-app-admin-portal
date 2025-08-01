import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from '../assignments-status-chips/BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useStatusChip } from '../data';

const FailedCancellation = ({ trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_CANCELLATION,
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_CANCELLATION_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName:
      BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_CANCELLATION,
    chipHelpCenterEventName:
      BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_FAILED_CANCELLATION_HELP_CENTER,
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
        Failed: Cancellation
      </Chip>

      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
        withPortal
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          Failed: Cancellation
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            This approved request was not canceled. Something went wrong behind
            the scenes.
          </p>
          <div className="micro">
            <p className="h6">Suggested resolution steps</p>
            <ul className="text-gray pl-3">
              <li>Wait and try to cancel this approved request again later</li>
              <li>If the issue continues, contact customer support</li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink
                  destination={
                    getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL
                  }
                  onClick={helpCenterTrackEvent}
                  target="_blank"
                >
                  Help Center
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
