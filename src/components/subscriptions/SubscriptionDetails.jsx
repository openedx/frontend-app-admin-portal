import React, { useContext } from 'react';
import moment from 'moment';

import { SubscriptionContext } from './SubscriptionData';

export default function SubscriptionDetails() {
  const { details } = useContext(SubscriptionContext);

  return (
    <React.Fragment>
      <h3>Details</h3>
      <div className="mt-3 d-flex align-items-center">
        <div className="mr-5">
          <div className="text-uppercase text-muted">
            <small>Purchase Date</small>
          </div>
          <div className="lead">
            {moment(details.purchaseDate).format('MMMM D, YYYY')}
          </div>
        </div>
        <div className="mr-5">
          <div className="text-uppercase text-muted">
            <small>Start Date</small>
          </div>
          <div className="lead">
            {moment(details.startDate).format('MMMM D, YYYY')}
          </div>
        </div>
        <div>
          <div className="text-uppercase text-muted">
            <small>End Date</small>
          </div>
          <div className="lead">
            {moment(details.endDate).format('MMMM D, YYYY')}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
