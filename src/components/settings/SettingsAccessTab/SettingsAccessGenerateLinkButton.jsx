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

function SettingsAccessGenerateLinkButton({
  enterpriseUUID,
  formattedLinkExpirationDate,
  onSuccess,
  disabled,
}) {
  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);

  const buttonState = loadingLinkCreation ? 'loading' : 'default';

  const handleGenerateLink = async () => {
    setLoadingLinkCreation(true);
    try {
      if (!formattedLinkExpirationDate) {
        throw new Error('Attempted to generate universal link without an expiration date');
      }
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
}

SettingsAccessGenerateLinkButton.defaultProps = {
  disabled: false,
  formattedLinkExpirationDate: null,
};
SettingsAccessGenerateLinkButton.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  formattedLinkExpirationDate: (props) => {
    if (!props.disabled && !props.formattedLinkExpirationDate) {
      throw new Error('Please provide a formattedLinkExpirationDate if the button is not disabled!');
    }
  },
  disabled: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
};

export default SettingsAccessGenerateLinkButton;
