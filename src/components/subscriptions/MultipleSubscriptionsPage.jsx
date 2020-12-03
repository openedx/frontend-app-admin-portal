import React, { useContext } from 'react';
import { Button, Card } from '@edx/paragon';
import { SubscriptionContext } from './SubscriptionData';

const MultipleSubscriptionsPage = () => {
  const subsContext = useContext(SubscriptionContext);
  const cardStyle = {
    width: '25rem',
  };
  const listStyle = {
    'padding-left': '20px',
    'margin-bottom': '24px',
  };
  console.log(subsContext);
  return (
    <>
      <div className="mt-3 mb-3">
        <h3>
          Invite your learners to access your course catalog and manage your subscription batches
        </h3>
      </div>
      <div className="d-flex">
        <div>
          <div className="mt-4 mb-2 text-secondary-500">
            <h4>Cohorts</h4>
          </div>
          <div className="mt-1">
            <Card style={cardStyle}>
              <div className="m-3">
                <h4>Fall Semester 2021</h4>
                <p className="small">
                  August 1, 2020 - July 31, 2021
                </p>
                <p className="mt-3 mb-0 small">
                  License assignments
                </p>
                <h4>
                  50 of 50
                </h4>
                <div className="d-flex">
                  <div className="ml-auto">
                    <Button variant="outline-primary">
                      Manage learners
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="ml-auto">
          <div className="mt-4 mb-2 text-secondary-500">
            <h4>
              Need help?
            </h4>
          </div>
          <div className="mt-1">
            <Card style={cardStyle}>
              <div className="m-3">
                <h4>Customer support is here to help</h4>
                <ul style={listStyle}>
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
                    <Button variant="outline-primary">
                      Contact customer support
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultipleSubscriptionsPage;
