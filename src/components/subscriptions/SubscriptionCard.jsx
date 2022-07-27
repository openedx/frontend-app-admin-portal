import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Stack,
  Row,
  Col,
} from '@edx/paragon';

import classNames from 'classnames';
import { getSubscriptionStatus } from './data/utils';
import { ACTIVE, SCHEDULED, SUBSCRIPTION_STATUS_BADGE_MAP } from './data/constants';

function SubscriptionCard({
  subscription,
  createActions,
}) {
  const {
    title,
    startDate,
    expirationDate,
    licenses = {},
  } = subscription;

  const formattedStartDate = moment(startDate).format('MMMM D, YYYY');
  const formattedExpirationDate = moment(expirationDate).format('MMMM D, YYYY');
  const subscriptionStatus = getSubscriptionStatus(subscription);

  const renderDaysUntilPlanStartText = (className) => {
    if (!(subscriptionStatus === SCHEDULED)) {
      return null;
    }

    const now = moment();
    const planStart = moment(startDate);
    const daysUntilPlanStart = planStart.diff(now, 'days');
    const hoursUntilPlanStart = planStart.diff(now, 'hours');

    return (
      <span className={classNames('d-block small', className)}>
        Plan begins in {
          daysUntilPlanStart > 0 ? `${daysUntilPlanStart} day${daysUntilPlanStart > 1 ? 's' : ''}`
            : `${hoursUntilPlanStart} hour${hoursUntilPlanStart > 1 ? 's' : ''}`
        }
      </span>
    );
  };

  const renderActions = () => {
    const actions = createActions?.(subscription) || [];

    if (actions.length === 0) {
      return null;
    }

    return actions.map(action => (
      <Button
        key={action.to}
        variant={action.variant}
        as={Link}
        to={action.to}
      >
        {action.buttonText}
      </Button>
    ));
  };

  const renderCardHeader = () => {
    const subtitle = (
      <div className="d-flex flex-wrap align-items-center">
        <Stack direction="horizontal" gap={3}>
          <Badge variant={SUBSCRIPTION_STATUS_BADGE_MAP[subscriptionStatus].variant}>
            {subscriptionStatus}
          </Badge>
          <span>
            {formattedStartDate} - {formattedExpirationDate}
          </span>
        </Stack>
      </div>
    );

    return (
      <Card.Header
        className={classNames({
          'pb-1': subscriptionStatus !== ACTIVE,
        })}
        title={title}
        subtitle={subtitle}
        actions={(
          <>
            {renderActions() || renderDaysUntilPlanStartText('mt-4')}
          </>
        )}
      />
    );
  };

  const renderCardSection = () => {
    if (subscriptionStatus !== ACTIVE) {
      return null;
    }

    return (
      <Card.Section
        title="Licenses"
        muted
      >
        <Row className="d-flex flex-row justify-content-between w-md-75">
          {['Assigned', 'Activated', 'Allocated', 'Unassigned'].map(licenseStatus => (
            <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0" key={licenseStatus}>
              <span className="small">{licenseStatus}</span>
              <span>{licenses[licenseStatus.toLowerCase()]} of {licenses.total}</span>
            </Col>
          ))}
        </Row>
      </Card.Section>
    );
  };

  return (
    <Card
      orientation="horizontal"
      className={classNames('subscription-card', {
        'pb-4': subscriptionStatus !== ACTIVE,
      })}
    >
      <Card.Body>
        <Stack gap={4}>
          {renderCardHeader()}
          {renderCardSection()}
        </Stack>
      </Card.Body>
    </Card>
  );
}

SubscriptionCard.defaultProps = {
  createActions: null,
};

SubscriptionCard.propTypes = {
  subscription: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    licenses: PropTypes.shape({
      assigned: PropTypes.number.isRequired,
      activated: PropTypes.number.isRequired,
      allocated: PropTypes.number.isRequired,
      unassigned: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    }),
  }).isRequired,
  createActions: PropTypes.func,
};

export default SubscriptionCard;
