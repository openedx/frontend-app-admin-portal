import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from '../assignments-status-chips/BaseModalPopup';
import EVENT_NAMES from '../../../eventTracking';
import { useStatusChip } from '../data';

const GenericError = ({
  errorReason,
  trackEvent,
  recentAction,
}) => {
  const [target, setTarget] = useState(null);
  const isDeclinedReason = recentAction === 'declined';
  const isApprovedReason = recentAction === 'approved';

  const {
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR,
    BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName:
      BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR,
    chipHelpCenterEventName:
      BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR_HELP_CENTER,
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
        {errorReason}
      </Chip>

      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
          {errorReason}
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>
            {isDeclinedReason && 'Your attempt to decline this enrollment request has failed. '}
            {isApprovedReason && 'This enrollment request was not approved. '}
            Something went wrong behind the scenes.
          </p>
          <div className="micro">
            <p className="h6">Suggested resolution steps</p>
            <ul className="text-gray pl-3">
              <li>Wait and try to {isDeclinedReason ? 'decline' : 'approve'} this enrollment request again later</li>
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

GenericError.propTypes = {
  errorReason: PropTypes.string.isRequired,
  trackEvent: PropTypes.func.isRequired,
  recentAction: PropTypes.string,
};

GenericError.defaultProps = {
  recentAction: null,
};

export default GenericError;
