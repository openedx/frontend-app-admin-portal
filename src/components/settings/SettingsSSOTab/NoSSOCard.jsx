import React from 'react';
import PropTypes from 'prop-types';

import { Button, Card } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import cardImage from '../../../data/images/NoSSO.svg';

const NoSSOCard = ({
  setShowNoSSOCard, setShowNewSSOForm, setIsStepperOpen,
}) => {
  const intl = useIntl();
  const onClick = () => {
    setShowNoSSOCard(false);
    setIsStepperOpen(true);
    setShowNewSSOForm(true);
  };

  return (
    <Card style={{ width: '60%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt={intl.formatMessage({
          id: 'adminPortal.settings.noSSOCard.imageAlt',
          defaultMessage: 'SSO image',
          description: 'Alt text for the SSO image on the No SSO card',
        })}
      />
      <Card.Section className="text-center">
        <h2>
          <FormattedMessage
            id="adminPortal.settings.noSSOCard.title"
            defaultMessage="You don't have any SSOs integrated yet."
            description="Title for the No SSO card"
          />
        </h2>
        <p className="mb-0">
          <FormattedMessage
            id="adminPortal.settings.noSSOCard.description"
            defaultMessage="SSO enables learners who are signed in to their enterprise LMS or other system to easily register and enroll in courses on edX without needing to sign in again. edX for Business uses SAML 2.0 to implement SSO between an enterprise system and edX.org."
            description="Description for the No SSO card"
          />
        </p>
      </Card.Section>
      <Card.Footer className="justify-content-center">
        <Button iconBefore={Add} onClick={onClick} variant="primary">
          <FormattedMessage
            id="adminPortal.settings.noSSOCard.newSSOButton"
            defaultMessage="New SSO integration"
            description="Button to create a new SSO integration"
          />
        </Button>
      </Card.Footer>
    </Card>
  );
};

NoSSOCard.propTypes = {
  setShowNoSSOCard: PropTypes.func.isRequired,
  setShowNewSSOForm: PropTypes.func.isRequired,
  setIsStepperOpen: PropTypes.func.isRequired,
};

export default NoSSOCard;
