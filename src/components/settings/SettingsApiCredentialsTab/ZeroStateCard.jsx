import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Card, Icon, MailtoLink, Spinner,
} from '@edx/paragon';
import { Add, Error } from '@edx/paragon/icons';

import cardImage from '../../../data/images/ZeroState.svg';
import {
  EnterpriseId,
} from './Context';
import LmsApiService from '../../../data/services/LmsApiService';
import {
  API_CLIENT_DOCUMENTATION, API_TERMS_OF_SERVICE, ENTERPRISE_CUSTOMER_SUPPORT_EMAIL,
} from '../data/constants';

const ZeroStateCard = ({ setShowToast, setData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [displayFailureAlert, setFailureAlert] = useState(false);
  const enterpriseId = useContext(EnterpriseId);
  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await LmsApiService.createNewAPICredentials(enterpriseId);
      const data = { ...response.data, api_client_documentation: API_CLIENT_DOCUMENTATION };
      setData(data);
      setShowToast(true);
    } catch (err) {
      setFailureAlert(true);
    }
  };

  return (
    <Card style={{ width: '70%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt="Card image"
      />
      <Card.Section className="text-center">
        <h2>You don&apos;t have API credentials yet.</h2>
        { !displayFailureAlert && (
        <p>
          This page allows you to generate API credentials to send to&nbsp;
          your developers so they can work on integration projects.
          If you believe you are seeing this page in error,&nbsp;
          <MailtoLink to={ENTERPRISE_CUSTOMER_SUPPORT_EMAIL} target="_blank" rel="noopener noreferrer">
            contact Enterprise Customer Support.
          </MailtoLink>
        </p>
        )}
        <p>
          edX for Business API credentials credentials will provide access&nbsp;
          to the following edX API endpoints: reporting dashboard, dashboard, and catalog administration.
        </p>
        <p>
          By clicking the button below, you and your organization accept the {'\n'}
          <a href={API_TERMS_OF_SERVICE}>edX API terms of service</a>.
        </p>
      </Card.Section>
      <Card.Footer className={displayFailureAlert ? 'error-footer d-table-row' : ''}>
        { displayFailureAlert && (
        <p className="d-flex small">
          <Icon className="error-icon" src={Error} />
          Something went wrong while generating your credentials.
          Please try again. If the issue continues, contact Enterprise Customer Support.
        </p>
        )}
        <Button
          variant="primary"
          size="lg"
          iconBefore={isLoading ? null : Add}
          onClick={handleClick}
          block
        >
          {isLoading && <Spinner animation="border mr-2" />}
          {isLoading ? 'Generating...' : 'Generate API Credentials'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

ZeroStateCard.propTypes = {
  setShowToast: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
};

export default ZeroStateCard;
