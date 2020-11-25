import React, { useContext } from 'react';

import { SubscriptionContext } from './SubscriptionData';
import { formatTimestamp } from '../../utils';

export default function SubscriptionDetails() {
  const { details } = useContext(SubscriptionContext);

  return (
    <>
      <h3>Details</h3>
      <div className="mt-3 d-flex align-items-center">
        <div className="mr-5">
          <div className="text-uppercase text-muted">
            <small>Start Date</small>
          </div>
          <div className="lead">
            {formatTimestamp({ timestamp: details.startDate })}
          </div>
        </div>
        <div>
          <div className="text-uppercase text-muted">
            <small>End Date</small>
          </div>
          <div className="lead">
            {formatTimestamp({ timestamp: details.expirationDate })}
          </div>
        </div>
      </div>
    </>
  );
}
