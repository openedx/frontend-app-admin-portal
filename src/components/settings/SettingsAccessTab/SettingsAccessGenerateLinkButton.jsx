import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useIntl } from '@edx/frontend-platform/i18n';
import LmsApiService from '../../../data/services/LmsApiService';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';
import { MAX_UNIVERSAL_LINKS } from '../data/constants';

const SettingsAccessGenerateLinkButton = ({
  enterpriseUUID,
  onSuccess,
  linksCount,
  disabled,
}) => {
  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);
  const intl = useIntl();

  const buttonState = loadingLinkCreation ? 'loading' : 'default';

  const BUTTON_PROPS = {
    labels: {
      default: intl.formatMessage({
        id: 'adminPortal.settings.access.generateLinkButton',
        defaultMessage: 'Generate link',
        description: 'Label for the generate link button.',
      }),
      pending: intl.formatMessage({
        id: 'adminPortal.settings.access.generateLinkButton.pending',
        defaultMessage: 'Generating link',
        description: 'Label for the generate link button in pending state.',
      }),
      loading: intl.formatMessage({
        id: 'adminPortal.settings.access.generateLinkButton.loading',
        defaultMessage: 'Readying link generation',
        description: 'Label for the generate link button in loading state.',
      }),
    },
    disabledStates: ['pending', 'loading'],
    variant: 'primary',
  };

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
