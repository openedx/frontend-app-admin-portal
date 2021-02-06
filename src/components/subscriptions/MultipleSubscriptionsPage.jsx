import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  CardGrid,
  Row,
  Col,
} from '@edx/paragon';

import { SubscriptionContext } from './SubscriptionData';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionsHelpPopover from './SubscriptionsHelpPopover';

const MultipleSubscriptionsPage = ({ match }) => {
  const { params: { enterpriseSlug } } = match;
  const { data } = useContext(SubscriptionContext);
  let subscriptions = data.results;

  if (subscriptions.length === 0) {
    return null;
  }
  // if (subscriptions.length === 1) {
  //   return (
  //     <Redirect to={`/${enterpriseSlug}/admin/subscriptions/${subscriptions[0].uuid}`} />
  //   );
  // }

  subscriptions = [subscriptions[0], subscriptions[0], subscriptions[0], subscriptions[0], subscriptions[0]];

  const subscriptionFurthestFromExpiration = subscriptions.reduce((sub1, sub2) => (
    new Date(sub1.expirationDate) > new Date(sub2.expirationDate) ? sub1 : sub2));

  return (
    <>
      <SubscriptionDetailContextProvider subscription={subscriptionFurthestFromExpiration}>
        {subscriptionFurthestFromExpiration.daysUntilExpiration > 0 && (
          <SubscriptionExpirationBanner />
        )}
        <SubscriptionExpirationModal />
      </SubscriptionDetailContextProvider>
      <Row>
        <Col>
          <h2>Cohorts</h2>
          <p className="lead">
            Invite your learners to access your course catalog and manage your subscription cohorts
          </p>
        </Col>
        <Col className="d-flex flex-column align-items-end">
          <SubscriptionsHelpPopover enterpriseSlug={enterpriseSlug} />
        </Col>
      </Row>
      <Row>
        <CardGrid>
          {subscriptions.map(subscription => (
            <SubscriptionCard
              uuid={subscription?.uuid}
              title={subscription?.title}
              enterpriseSlug={enterpriseSlug}
              startDate={subscription?.startDate}
              expirationDate={subscription?.expirationDate}
              licenses={subscription?.licenses || {}}
            />
          ))}
        </CardGrid>
        {/* <Col>
          <h3>Need help?</h3>
          <Card className="support-card">
            <Card.Body>
              <Card.Title>Customer Support can help</Card.Title>
              <ul className="pl-4">
                <li>
                  Manage your individual subscription cohorts
                </li>
                <li>
                  Add new cohorts to your Subscription Management page
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
        </Col> */}
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
