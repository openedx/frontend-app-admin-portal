import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton,
} from '@edx/paragon';
import moment from 'moment';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../../data/services/LmsApiService';
import { SettingsContext } from '../SettingsContext';

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
  onSuccess,
  disabled,
}) => {
  const {
    enterpriseId,
    loadingCustomerAgreement,
    customerAgreement: { netDaysUntilExpiration },
  } = useContext(SettingsContext);

  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);

  const buttonState = loadingLinkCreation ? 'loading' : 'default';

  const handleGenerateLink = async () => {
    setLoadingLinkCreation(true);
    // Generate expiration date of netDaysUntilExpiration
    const expirationDate = moment().add(netDaysUntilExpiration, 'days').startOf('day').format();
    try {
      const response = await LmsApiService.createEnterpriseCustomerLink(enterpriseId, expirationDate);
      onSuccess(response);
    } catch (error) {
      logError(error);
    } finally {
      setLoadingLinkCreation(false);
    }
  };

  return (
    <StatefulButton
      disabled={disabled || loadingCustomerAgreement}
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
  disabled: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
};

export default SettingsAccessGenerateLinkButton;
