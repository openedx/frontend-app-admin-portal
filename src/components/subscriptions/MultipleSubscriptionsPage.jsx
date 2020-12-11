import React, { useContext } from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Badge, Card } from '@edx/paragon';

import { SubscriptionContext } from './SubscriptionData';

const MultipleSubscriptionsPage = ({ match }) => {
  const { params: { enterpriseSlug } } = match;
  const { data } = useContext(SubscriptionContext);
  const subscriptions = data.results;
  if (subscriptions.length === 0) {
    return null;
  }
  if (subscriptions.length === 1) {
    return (
      <Redirect to={`subscriptions/${subscriptions[0].uuid}`} />
    );
  }

  const renderCard = (index) => {
    const {
      uuid,
      title,
      startDate,
      expirationDate,
      licenses,
    } = subscriptions[index] || {};
    const {
      allocated,
      total,
    } = licenses || {};
    const startDateString = moment(startDate).format('MMMM D, YYYY');
    const expirationDateString = moment(expirationDate).format('MMMM D, YYYY');
    const isExpired = moment().isAfter(expirationDate);
    // TODO: add bootstrap classes for smaller page sizes
    return (
      <div className="mt-1" key={index}>
        <Card>
          <div className="m-3">
            <div className="row ml-0 mr-0">
              {/* TODO: Do we want to have this title link to the detail view? */}
              <h4>{title}</h4>
              <div className="ml-2">
                {isExpired && (
                  <Badge variant="danger">
                    Expired
                  </Badge>
                )}
              </div>
            </div>
            <p className="small">
              {startDateString} - {expirationDateString}
            </p>
            <p className="mt-3 mb-0 small">
              License assignments
            </p>
            <div className="h4">
              {allocated} of {total}
            </div>
            <div className="d-flex">
              <div className="ml-auto">
                <Link to={`/${enterpriseSlug}/admin/subscriptions/${uuid}`} className="btn btn-outline-primary">
                  {isExpired ? 'View' : 'Manage'} learners
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCardsForColumn = columnIndex => {
    const numSubscriptions = subscriptions.length;
    const indexesToRender = [...Array(numSubscriptions).keys()].filter(num => num % 3 === columnIndex);
    return indexesToRender.map(index => renderCard(index));
  };

  return (
    <>
      <div className="mt-3 mb-3">
        <h2 className="h3">
          Invite your learners to access your course catalog and manage your subscription batches
        </h2>
      </div>
      <div className="d-flex">
        <div className="col-9 p-0">
          <div className="mt-4 mb-2 text-secondary-500">
            <h3 className="h4">Cohorts</h3>
          </div>
          <div className="row mr-3">
            <div className="col pr-0">
              {renderCardsForColumn(0)}
            </div>
            <div className="col pr-0">
              {renderCardsForColumn(1)}
            </div>
            <div className="col pr-0">
              {renderCardsForColumn(2)}
            </div>
          </div>
        </div>
        <div className="ml-auto col-3 p-0">
          <div className="mt-4 mb-2 text-secondary-500">
            <h3 className="h4">Need help?</h3>
          </div>
          <div className="pt-1">
            <Card>
              <Card.Body>
                <h4>Customer support can help</h4>
                <ul className="pl-4">
                  <li>
                    Manage your individual subscription batches
                  </li>
                  <li>
                    Add new batches to your Subscription Management page
                  </li>
                  <li>
                    Lorem ipsum dolor sit amet
                  </li>
                </ul>
                <div className="d-flex">
                  <div className="ml-auto">
                    <Link to={`/${enterpriseSlug}/admin/support`} className="btn btn-outline-primary">
                      Contact Customer Support
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

MultipleSubscriptionsPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MultipleSubscriptionsPage;
