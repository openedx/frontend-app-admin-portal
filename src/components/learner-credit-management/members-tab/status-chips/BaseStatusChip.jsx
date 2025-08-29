import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Chip, Hyperlink } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { HELP_CENTER_GROUPS_INVITE_LINK } from '../../../settings/data/constants';
import { useStatusChip } from '../../data';
import BaseModalPopup from '../../assignments-status-chips/BaseModalPopup';

const BaseStatusChip = ({
  enterpriseId, icon, text, popoverHeader, popoverBody,
  popoverExtra1, popoverExtra2, statusEventName, helpEventName,
}) => {
  const sendTrackEvent = (eventName, eventMetadata = {}) => {
    sendEnterpriseTrackEvent(enterpriseId, eventName, {
      ...eventMetadata,
    });
  };
  const [target, setTarget] = useState(null);
  const {
    openChipModal,
    closeChipModal,
    isChipModalOpen,
    helpCenterTrackEvent,
  } = useStatusChip({
    chipInteractionEventName: statusEventName,
    chipHelpCenterEventName: helpEventName,
    trackEvent: sendTrackEvent,
  });

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={icon}
        onClick={openChipModal}
        onKeyPress={openChipModal}
        tabIndex={0}
      >
        {text}
      </Chip>
      <BaseModalPopup
        positionRef={target}
        isOpen={isChipModalOpen}
        onClose={closeChipModal}
      >
        <BaseModalPopup.Heading icon={icon}>
          {popoverHeader}
        </BaseModalPopup.Heading>
        <BaseModalPopup.Content>
          <p>{popoverBody}</p>
          <div className="micro">
            {popoverExtra1 && (
              <>
                <p className="h6">{popoverExtra1}</p>
                <ul className="text-gray pl-3">
                  {popoverExtra2}
                  <Hyperlink
                    destination={HELP_CENTER_GROUPS_INVITE_LINK}
                    onClick={helpCenterTrackEvent}
                    target="_blank"
                  >
                    Help Center: Inviting Budget Members
                  </Hyperlink>
                </ul>
              </>
            )}
          </div>
        </BaseModalPopup.Content>
      </BaseModalPopup>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

BaseStatusChip.defaultProps = {
  popoverExtra1: '',
  popoverExtra2: '',
};

BaseStatusChip.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  popoverHeader: PropTypes.string.isRequired,
  popoverBody: PropTypes.string.isRequired,
  popoverExtra1: PropTypes.string,
  popoverExtra2: PropTypes.string,
  statusEventName: PropTypes.string.isRequired,
  helpEventName: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BaseStatusChip);
