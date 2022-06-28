import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';
import { Info, WarningFilled } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import ContactCustomerSupportButton from '../ContactCustomerSupportButton';
import {
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
} from './data/constants';

const OfferUtilizationAlerts = ({
  className,
  percentUtilized,
  remainingFunds,
  enterpriseUUID,
}) => {
  const [isWarningAlertShown, setIsWarningAlertShown] = useState(false);

  useEffect(() => {
    const isWarningTheshold = (
      percentUtilized > LOW_REMAINING_BALANCE_PERCENT_THRESHOLD
      && remainingFunds > NO_BALANCE_REMAINING_DOLLAR_THRESHOLD
    );
    setIsWarningAlertShown(isWarningTheshold);
  }, [percentUtilized, remainingFunds]);

  if (percentUtilized === undefined || remainingFunds === undefined) {
    return null;
  }

  const isErrorAlertShown = remainingFunds <= NO_BALANCE_REMAINING_DOLLAR_THRESHOLD;

  const handleContactSupportCTAClick = (eventName) => {
    sendEnterpriseTrackEvent(enterpriseUUID, eventName);
  };

  const handleOnCloseWarningAlert = () => {
    sendEnterpriseTrackEvent(
      enterpriseUUID,
      'edx.ui.enterprise.admin-portal.learner-credit-management.alerts.low-remaining-funds.dismissed',
    );
    setIsWarningAlertShown(false);
  };

  return (
    <>
      <Alert
        variant="warning"
        show={isWarningAlertShown}
        icon={WarningFilled}
        className={className}
        dismissible
        onClose={handleOnCloseWarningAlert}
        actions={[
          <ContactCustomerSupportButton
            variant="primary"
            onClick={() => handleContactSupportCTAClick(
              'edx.ui.admin-portal.learner-credit-management.alerts.low-remaining-funds.contact-support.clicked',
            )}
          />,
        ]}
      >
        <Alert.Heading>Low remaining funds</Alert.Heading>
        <p>
          Your learning credit is over {(LOW_REMAINING_BALANCE_PERCENT_THRESHOLD * 100).toFixed(1)}% utilized. To
          add additional funds and avoid downtime for your learners, reach out to customer support.
        </p>
      </Alert>
      <Alert
        variant="danger"
        show={isErrorAlertShown}
        icon={Info}
        className={className}
        actions={[
          <ContactCustomerSupportButton
            variant="primary"
            onClick={() => handleContactSupportCTAClick(
              'edx.ui.admin-portal.learner-credit-management.alerts.no-remaining-funds.contact-support.clicked',
            )}
          />,
        ]}
      >
        <Alert.Heading>No remaining funds</Alert.Heading>
        <p>
          Your learning credit no longer has funds remaining. To add additional funds and
          avoid downtime for your learners, reach out to customer support.
        </p>
      </Alert>
    </>
  );
};

OfferUtilizationAlerts.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  className: PropTypes.string,
  percentUtilized: PropTypes.number,
  remainingFunds: PropTypes.number,
};

OfferUtilizationAlerts.defaultProps = {
  className: undefined,
  percentUtilized: undefined,
  remainingFunds: undefined,
};

export default OfferUtilizationAlerts;
