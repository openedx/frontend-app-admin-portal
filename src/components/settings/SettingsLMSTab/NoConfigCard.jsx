import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Button, Card, Icon } from '@edx/paragon';

import { Add, Error } from '@edx/paragon/icons';
import cardImage from '../../../data/images/NoConfig.svg';

const NoConfigCard = ({
  enterpriseSlug, setShowNoConfigCard, createNewConfig, hasSSOConfig,
}) => {
  const onClick = () => {
    setShowNoConfigCard(false);
    createNewConfig(true);
  };

  return (
    <Card style={{ width: '70%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt="Card image"
      />
      <Card.Section className="text-center">
        <h2>You don&apos;t have any learning platforms integrated yet.</h2>
        <p className="mb-0">edX For Business seamlessly integrates with many of the most popular Learning Management Systems
          (LMSes) and Learning Experience Platforms (LXPs), enabling your learners to discover and access all
          the same world-class edX content from a single, centralized location.
        </p>
      </Card.Section>
      { hasSSOConfig && (
      <Card.Footer className="justify-content-center">
        <Button iconBefore={Add} onClick={onClick} variant="primary">New learning platform integration</Button>
      </Card.Footer>
      )}
      { !hasSSOConfig && (
      <Card.Footer className="error-footer">
        <p className="d-flex small"><Icon className="error-icon" src={Error} />At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration.</p>
        <Link
          className="request-codes-btn btn btn-primary"
          to={`/${enterpriseSlug}/admin/settings/sso`}
        >
          <Icon src={Add} />New SSO integration
        </Link>
      </Card.Footer>
      )}
    </Card>
  );
};

NoConfigCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  setShowNoConfigCard: PropTypes.func.isRequired,
  createNewConfig: PropTypes.func.isRequired,
  hasSSOConfig: PropTypes.bool.isRequired,
};

export default NoConfigCard;
