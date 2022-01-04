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
  onError,
}) => {
  const {
    enterpriseId,
    loadingCustomerAgreement,
    customerAgreement: { netDaysUntilExpiration },
  } = useContext(SettingsContext);

  const [loadingLinkCreation, setLoadingLinkCreation] = useState(false);

  let buttonState = 'default';
  if (loadingCustomerAgreement) {
    buttonState = 'loading';
  } else if (loadingLinkCreation) {
    buttonState = 'pending';
  }

  const handleGenerateLink = () => {
    setLoadingLinkCreation(true);
    const expirationDate = moment().add(netDaysUntilExpiration, 'days').format();

    LmsApiService.createEnterpriseCustomerLink(enterpriseId, expirationDate)
      .then((response) => {
        onSuccess(response);
      })
      .catch((error) => {
        logError(error);
        onError(error);
      })
      .finally(() => {
        setLoadingLinkCreation(false);
      });
  };

  return (
    <StatefulButton
      {...BUTTON_PROPS}
      state={buttonState}
      onClick={handleGenerateLink}
    />
  );
};

SettingsAccessGenerateLinkButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default SettingsAccessGenerateLinkButton;
