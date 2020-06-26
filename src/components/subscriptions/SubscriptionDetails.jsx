import React, { useContext } from 'react';
import moment from 'moment';

import { SubscriptionContext } from './SubscriptionData';
import { SUBSCRIPTIONS } from './constants';
import LoadingMessage from '../../components/LoadingMessage';
import StatusAlert from '../StatusAlert';

export default function SubscriptionDetails() {
  const { details, requestStatus, errors } = useContext(SubscriptionContext);
  const { isLoading } = requestStatus[SUBSCRIPTIONS] || { isLoading: false };
  const error = errors[SUBSCRIPTIONS];

  return (
    <React.Fragment>
      <h3>Details</h3>
      {isLoading && <LoadingMessage className="loading mt-3" />}
      {
        error && <StatusAlert
          className="mt-3"
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title={`Unable to load data for ${error.key}`}
          message={`Try refreshing your screen (${error.message})`}
        />
      }
      {
        !isLoading && !error &&
        <div className="mt-3 d-flex align-items-center">
          <div className="mr-5">
            <div className="text-uppercase text-muted">
              <small>Purchase Date</small>
            </div>
            <div className="lead">
              {moment(details.purchase_date)
                .format('MMMM D, YYYY')}
            </div>
          </div>
          <div className="mr-5">
            <div className="text-uppercase text-muted">
              <small>Start Date</small>
            </div>
            <div className="lead">
              {moment(details.start_date)
                .format('MMMM D, YYYY')}
            </div>
          </div>
          <div>
            <div className="text-uppercase text-muted">
              <small>End Date</small>
            </div>
            <div className="lead">
              {moment(details.expiration_date)
                .format('MMMM D, YYYY')}
            </div>
          </div>
        </div>
      }
    </React.Fragment>
  );
}
