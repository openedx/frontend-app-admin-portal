import { Card, Button, Icon } from '@edx/paragon';
import { Add, SpinnerSimple, Error } from '@edx/paragon/icons';
import React, { useState, useContext } from 'react';
import cardImage from '../../../data/images/ZeroState.svg';
import { ZeroStateHandlerContext, ShowSuccessToast, DataContext } from './Context';
import LmsApiService from '../../../data/services/LmsApiService';
import { API_TERMS_OF_SERVICE } from '../data/constants';

const ZeroStateCard = () => {
  const [, setZeroState] = useContext(ZeroStateHandlerContext);
  const [, setShowToast] = useContext(ShowSuccessToast);
  const [, setData] = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [displayFailureAlert, setFailureAlert] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await LmsApiService.createNewAPICredentials();
      setData(response.data);
      setIsLoading(false);
      setZeroState(false);
      setShowToast(true);
    } catch (err) {
      setFailureAlert(true);
      setIsLoading(false);
      setZeroState(true);
      setIsLoading(false);
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
        <h2>You don&apos;t hava API credentials yet.</h2>
        { !displayFailureAlert && (
        <p>
          This page allows you to generate API credentials to send to&nbsp;
          your developers so they can work on integration projects.
          If you believe you are seeing this page in error, contact Enterprise Customer Support.
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
          iconBefore={isLoading ? SpinnerSimple : Add}
          onClick={handleClick}
          block
        >
          {isLoading ? 'Generating...' : 'Generate API Credentials'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ZeroStateCard;
