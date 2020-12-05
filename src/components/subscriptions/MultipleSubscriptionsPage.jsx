import React, { useContext } from 'react';

import { Badge, Button, Card } from '@edx/paragon';
import { SubscriptionDetailContext } from './SubscriptionDetailData';

const MultipleSubscriptionsPage = () => {
  const subsContext = useContext(SubscriptionDetailContext);
  const listStyle = {
    paddingLeft: '20px',
    marginBottom: '24px',
  };
  console.log(subsContext);
  const renderCard = () => {
    // Where should this title actually come from? subs title or computed?
    const cardTitle = 'Fall Semester 2021';
    const assignedLicenses = 50;
    const totalLicenses = 50;
    return (
      <div className="mt-1">
        <Card>
          <div className="m-3">
            <div className="row ml-0 mr-0">
              <h4>{cardTitle}</h4>
              <div className="ml-2">
                <Badge variant="success">
                  Active
                </Badge>
              </div>
            </div>
            <p className="small">
              August 1, 2020 - July 31, 2021
            </p>
            <p className="mt-3 mb-0 small">
              License assignments
            </p>
            <h4>
              {`${assignedLicenses} of ${totalLicenses}`}
            </h4>
            <div className="d-flex">
              <div className="ml-auto">
                <Button variant="outline-primary">
                  View learners
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };
  return (
    <>
      <div className="mt-3 mb-3">
        <h3>
          Invite your learners to access your course catalog and manage your subscription batches
        </h3>
      </div>
      <div className="d-flex">
        <div className="col-9 p-0">
          <div className="mt-4 mb-2 text-secondary-500">
            <h4>Cohorts</h4>
          </div>
          <div className="row mr-3">
            <div className="col pr-0">
              {renderCard()}
            </div>
            <div className="col pr-0">
              {renderCard()}
            </div>
            <div className="col pr-0">
              {renderCard()}
            </div>
          </div>
        </div>
        <div className="ml-auto col-3 p-0">
          <div className="mt-4 mb-2 text-secondary-500">
            <h4>
              Need help?
            </h4>
          </div>
          <div className="pt-1">
            <Card>
              <div className="m-3">
                <h4>Customer support can help</h4>
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
