import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { getConfig } from '@edx/frontend-platform/config';
import BaseModalPopup from './BaseModalPopup';
import { useStatusChip } from '../data';
import EVENT_NAMES from '../../../eventTracking';
import { configuration } from '../../../config';

const IncompleteAssignment = ({ trackEvent }) => {
  const [target, setTarget] = useState(null);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_INCOMPLETE_ASSIGNMENT,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_INCOMPLETE_ASSIGNMENT_HELP_CENTER,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_INCOMPLETE_ASSIGNMENT,
    chipHelpCenterEventName: BUDGET_DETAILS_ASSIGNED_DATATABLE_CHIP_INCOMPLETE_ASSIGNMENT_HELP_CENTER,
    trackEvent,
  });
  const supportUrl = configuration.ENTERPRISE_SUPPORT_URL;
  const supportLearnerCreditUrl = getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL;

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={Error}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        tabIndex={0}
      >
        Incomplete
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={Error} iconClassName="text-warning">
          Incomplete assignment
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>This budget became inactive before the learner enrolled.</p>
          <div className="mt-3">
            <span className="font-weight-bold">Suggested resolution steps</span>
            <ul className="text-gray pl-3">
              <li>View an active budget on the budgets page and reassign the course to the learner.</li>
              <li>
                Create a new budget by{' '}
                <Hyperlink
                  destination={supportUrl}
                  onClick={helpCenterTrackEvent}
                  target="_blank"
                >
                  contacting support.
                </Hyperlink>.
              </li>
              <li>
                Get more troubleshooting help at{' '}
                <Hyperlink
                  destination={supportLearnerCreditUrl}
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

IncompleteAssignment.propTypes = {
  trackEvent: PropTypes.func.isRequired,
};

export default IncompleteAssignment;
