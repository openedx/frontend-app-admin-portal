import React, { useContext } from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Badge, Card, Row, Col,
} from '@edx/paragon';

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
      <Redirect to={`/${enterpriseSlug}/admin/subscriptions/${subscriptions[0].uuid}`} />
    );
  }

  const renderCard = (subscription = {}) => {
    const {
      uuid,
      title,
      startDate,
      expirationDate,
      licenses,
    } = subscription;
    const {
      allocated,
      total,
    } = licenses || {};
    const startDateString = moment(startDate).format('MMMM D, YYYY');
    const expirationDateString = moment(expirationDate).format('MMMM D, YYYY');
    const isExpired = moment().isAfter(expirationDate);
    return (
      <Col xs={12} md={6} xl={4} className="mb-3">
        <Card className="subscription-card">
          <Card.Body>
            <Card.Title>
              {title}
              {isExpired && (
                <div className="ml-2">
                  <Badge variant="danger">
                    Expired
                  </Badge>
                </div>
              )}
            </Card.Title>
            <p className="small">
              {startDateString} - {expirationDateString}
            </p>
            <p className="mt-3 mb-0 small">
              License assignments
            </p>
            <p className="lead font-weight-bold">
              {allocated} of {total}
            </p>
            <div className="d-flex">
              <div className="ml-auto">
                <Link to={`/${enterpriseSlug}/admin/subscriptions/${uuid}`} className="btn btn-outline-primary">
                  {isExpired ? 'View' : 'Manage'} learners
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <>
      <Row>
        <Col xs={12} lg={9}>
          <h2>Cohorts</h2>
          <p className="lead">
            Invite your learners to access your course catalog and manage your subscription batches
          </p>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={9}>
          <Row>
            {subscriptions.map(subscription => renderCard(subscription))}
          </Row>
        </Col>
        <Col>
          <h3>Need help?</h3>
          <Card className="support-card">
            <Card.Body>
              <Card.Title>Customer Support can help</Card.Title>
              <ul className="pl-4">
                <li>
                  Manage your individual subscription batches
                </li>
                <li>
                  Add new batches to your Subscription Management page
                </li>
                <li>
                  Help maximize the efficacy of your learning program
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
        </Col>
      </Row>
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
