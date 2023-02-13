import React from 'react';
import PropTypes from 'prop-types';

import { Button, Card } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import cardImage from '../../../data/images/NoSSO.svg';

const NoSSOCard = ({
  setShowNoSSOCard, setShowNewSSOForm,
}) => {
  const onClick = () => {
    setShowNoSSOCard(false);
    setShowNewSSOForm(true);
  };

  return (
    <Card style={{ width: '60%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt="SSO image"
      />
      <Card.Section className="text-center">
        <h2>You don&apos;t have any SSOs integrated yet.</h2>
        <p className="mb-0">SSO enables learners who are signed in to their enterprise LMS
          or other system to easily register and enroll in courses on edX without needing to
          sign in again. edX for Business uses SAML 2.0 to implement SSO between an enterprise
          system and edX.org.
        </p>
      </Card.Section>
      <Card.Footer className="justify-content-center">
        <Button iconBefore={Add} onClick={onClick} variant="primary">New SSO integration</Button>
      </Card.Footer>
    </Card>
  );
};

NoSSOCard.propTypes = {
  setShowNoSSOCard: PropTypes.func.isRequired,
  setShowNewSSOForm: PropTypes.func.isRequired,
};

export default NoSSOCard;
