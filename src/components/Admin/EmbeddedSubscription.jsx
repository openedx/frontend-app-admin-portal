import React, { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { useParams, Link } from 'react-router-dom';
import { Form, Icon } from '@edx/paragon';
import { Lightbulb, ArrowOutward } from '@edx/paragon/icons';
import ConnectedSubscriptionDetailPage from './SubscriptionDetailPage';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import { sortSubscriptionsByStatus } from '../subscriptions/data/utils';
import LoadingMessage from '../LoadingMessage';

const EmbeddedSubscription = () => {
  const { loading, data } = useContext(SubscriptionContext);
  const { enterpriseSlug } = useParams();
  const subscriptions = data.results;
  const [subscriptionUUID, setSubscriptionUUID] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const sortedSubscriptions = sortSubscriptionsByStatus(subscriptions);
  const activeSubscriptions = sortedSubscriptions.filter(c => !dayjs().isAfter(c.expirationDate));
  const match = { params: { subscriptionUUID } };
  if (!loading && activeSubscriptions.length > 0 && firstLoad) {
    match.params.subscriptionUUID = activeSubscriptions[0].uuid;
  }
  const inputChangeHandler = (event) => {
    setSubscriptionUUID(event.target.value);
    setFirstLoad(false);
    match.params.subscriptionUUID = event.target.value;
  };

  if (loading) {
    return <LoadingMessage className="subscriptions" />;
  }
  const bestPracticesUrl = 'https://business.edx.org/hubfs/Onboarding and Engagement/Engagement Assets/Key Timelines & Best Practices.pdf';

  return (
    <div>{
            !loading && activeSubscriptions.length > 0
            && (
            <>
              <h2 className="mt-4.5 mb-4">Manage Learners</h2>
              {activeSubscriptions.length > 1
                ? (
                  <>
                    <p className="ml-4 mt-3">Filter by subscription plan</p>
                    <div className="ml-2 col-8 col-md-6">
                      <Form.Control
                        as="select"
                        value={subscriptionUUID}
                        key={subscriptionUUID}
                        onChange={(e) => inputChangeHandler(e)}
                      >
                        {activeSubscriptions?.map(subscription => (
                          <option key={subscription.uuid} value={subscription.uuid}>{subscription.title}</option>
                        ))}
                      </Form.Control>
                    </div>
                  </>
                )
                : <h3 className="ml-4 mt-3">{activeSubscriptions[0].title}</h3>}
              <ConnectedSubscriptionDetailPage enterpriseSlug={enterpriseSlug} match={match} />
              <div className="d-flex align-items-center">
                <Icon src={Lightbulb} className="text-danger mr-2" />
                <span> Help Center: Learners report that nudges have a positive impact on their motivation and
                  performance.
                </span>
              </div>
              <div className="align-items-center">
                <span className="ml-4.5"> Learn more helpful tips in </span>
                <span>
                  <Link
                    to={bestPracticesUrl}
                    target="_blank"
                  >
                    Best Practices
                  </Link>
                  <Icon className="d-inline-flex ml-2" src={ArrowOutward} />
                </span>
              </div>
            </>
            )
        }
    </div>
  );
};

export default EmbeddedSubscription;
