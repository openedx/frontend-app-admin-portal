import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import LmsApiService from '../../../data/services/LmsApiService';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';

const BUTTON_PROPS = {
  labels: {
    default: 'Generate link',
    pending: 'Generating link',
    loading: 'Readying link generation',
  },
  disabledStates: ['pending', 'loading'],
  variant: 'primary',
};

const SettingsAccessGenerateLinkButton = ({
  enterpriseUUID,
  formattedLinkExpirationDate,
  onSuccess,
  disabled,
}) => {
  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);

  const buttonState = loadingLinkCreation ? 'loading' : 'default';

  const handleGenerateLink = async () => {
    setLoadingLinkCreation(true);
    try {
      const response = await LmsApiService.createEnterpriseCustomerLink(enterpriseUUID, formattedLinkExpirationDate);
      onSuccess(response);
    } catch (error) {
      logError(error);
    } finally {
      setLoadingLinkCreation(false);
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_GENERATE,
      );
    }
  };

  return (
    <StatefulButton
      disabled={disabled}
      {...BUTTON_PROPS}
      state={buttonState}
      onClick={handleGenerateLink}
    />
  );
};

SettingsAccessGenerateLinkButton.defaultProps = {
  disabled: false,
};
SettingsAccessGenerateLinkButton.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  formattedLinkExpirationDate: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
};

export default SettingsAccessGenerateLinkButton;
