import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';
import { Info, WarningFilled } from '@edx/paragon/icons';

import ContactCustomerSupportButton from '../ContactCustomerSupportButton';
import { LEARNER_CREDIT_UTILIZATION_THRESHOLDS } from './data/constants';

const OfferUtilizationAlerts = ({
  className,
  percentUtilized,
}) => {
  const [isWarningAlertShown, setIsWarningAlertShown] = useState(false);

  useEffect(() => {
    const isWarningTheshold = percentUtilized > LEARNER_CREDIT_UTILIZATION_THRESHOLDS.warning && percentUtilized < 1;
    setIsWarningAlertShown(isWarningTheshold);
  }, [percentUtilized]);

  if (!percentUtilized) {
    return null;
  }

  const isErrorAlertShown = percentUtilized >= 1;

  return (
    <>
      <Alert
        variant="warning"
        show={isWarningAlertShown}
        icon={WarningFilled}
        className={className}
        dismissible
        onClose={() => { setIsWarningAlertShown(false); }}
        actions={[
          <ContactCustomerSupportButton variant="primary" />,
        ]}
      >
        <Alert.Heading>Remaining funds low</Alert.Heading>
        <p>
          Your learning credit is over {(LEARNER_CREDIT_UTILIZATION_THRESHOLDS.warning * 100).toFixed(1)}% utilized. To
          add additional funds and avoid downtime for your learners, reach out to customer support.
        </p>
      </Alert>
      <Alert
        variant="danger"
        show={isErrorAlertShown}
        icon={Info}
        className={className}
        actions={[
          <ContactCustomerSupportButton variant="primary" />,
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
  className: PropTypes.string,
  percentUtilized: PropTypes.number,
};

OfferUtilizationAlerts.defaultProps = {
  className: undefined,
  percentUtilized: 0.0,
};

export default OfferUtilizationAlerts;
