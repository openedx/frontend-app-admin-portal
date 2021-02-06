import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@edx/paragon';

const SubscriptionCard = ({
  uuid,
  title,
  enterpriseSlug,
  startDate,
  expirationDate,
  licenses: {
    allocated,
    total,
  },
}) => {
  const formattedStartDate = moment(startDate).format('MMMM D, YYYY');
  const formattedExpirationDate = moment(expirationDate).format('MMMM D, YYYY');
  const isExpired = moment().isAfter(expirationDate);

  return (
    <Card className="subscription-card w-100">
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
          {formattedStartDate} - {formattedExpirationDate}
        </p>
        <p className="mt-3 mb-0 small">
          License assignments
        </p>
        <p className="lead font-weight-bold">
          {allocated} of {total}
        </p>
        <div className="d-flex">
          <div className="ml-auto">
            <Button as={Link} to={`/${enterpriseSlug}/admin/subscriptions/${uuid}`} variant="outline-primary">
              {isExpired ? 'View' : 'Manage'} learners
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

SubscriptionCard.propTypes = {
  uuid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  expirationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  licenses: PropTypes.shape({
    allocated: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default SubscriptionCard;
