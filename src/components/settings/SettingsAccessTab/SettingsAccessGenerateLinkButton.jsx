import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import LmsApiService from '../../../data/services/LmsApiService';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';
import { MAX_UNIVERSAL_LINKS } from '../data/constants';

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
  onSuccess,
  linksCount,
  disabled,
}) => {
  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);

  const buttonState = loadingLinkCreation ? 'loading' : 'default';

  const handleGenerateLink = async () => {
    setLoadingLinkCreation(true);
    try {
      const response = await LmsApiService.createEnterpriseCustomerLink(enterpriseUUID);
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
      disabled={disabled || linksCount >= MAX_UNIVERSAL_LINKS}
      {...BUTTON_PROPS}
      state={buttonState}
      onClick={handleGenerateLink}
    />
  );
};

SettingsAccessGenerateLinkButton.defaultProps = {
  disabled: false,
  linksCount: 0,
};
SettingsAccessGenerateLinkButton.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  linksCount: PropTypes.number,
  disabled: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
};

export default SettingsAccessGenerateLinkButton;
