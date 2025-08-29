import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Button, Card, Icon } from '@openedx/paragon';

import { Add, Error } from '@openedx/paragon/icons';
import cardImage from '../../../data/images/NoConfig.svg';

const NoConfigCard = ({
  enterpriseSlug, setShowNoConfigCard, openLmsStepper, hasSSOConfig,
}) => {
  const onClick = () => {
    setShowNoConfigCard(false);
    openLmsStepper();
  };

  return (
    <Card style={{ width: '70%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt="Card image"
      />
      <Card.Section className="text-center">
        <h2>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.noConfigCard.noIntegrations"
            defaultMessage="You do not have any learning platforms integrated yet."
            description="Message indicating no learning platforms are integrated"
          />
        </h2>
        <p className="mb-0">
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.noConfigCard.integrationInfo"
            defaultMessage="edX For Business seamlessly integrates with many of the most popular Learning Management Systems (LMSes) and Learning Experience Platforms (LXPs), enabling your learners to discover and access all the same world-class edX content from a single, centralized location."
            description="Information about LMS and LXP integrations"
          />
        </p>
      </Card.Section>
      { hasSSOConfig && (
        <Card.Footer className="justify-content-center">
          <Button iconBefore={Add} onClick={onClick} variant="primary">
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.noConfigCard.newIntegrationButton"
              defaultMessage="New learning platform integration"
              description="Button text for creating a new learning platform integration"
            />
          </Button>
        </Card.Footer>
      )}
      { !hasSSOConfig && (
        <Card.Footer className="error-footer">
          <p className="d-flex small">
            <Icon className="error-icon" src={Error} />
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.noConfigCard.ssoRequiredMessage"
              defaultMessage="At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration."
              description="Message indicating SSO is required for new integration"
            />
          </p>
          <Link
            className="request-codes-btn btn btn-primary"
            to={`/${enterpriseSlug}/admin/settings/sso`}
          >
            <Icon src={Add} />
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.noConfigCard.newSSOIntegrationButton"
              defaultMessage="New SSO integration"
              description="Button text for creating a new SSO integration"
            />
          </Link>
        </Card.Footer>
      )}
    </Card>
  );
};

NoConfigCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  setShowNoConfigCard: PropTypes.func.isRequired,
  openLmsStepper: PropTypes.func.isRequired,
  hasSSOConfig: PropTypes.bool.isRequired,
};

export default NoConfigCard;
