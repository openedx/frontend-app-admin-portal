import { Card, Button } from '@edx/paragon';
import { Add, SpinnerSimple } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import cardImage from '../../../data/images/ZeroState.svg';

const ZeroStateCard = ({ onClickStateChange }) => {
  const apiService = 'https://dummyjson.com/products/1';

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  // const [isSuccessPageOpen, openSuccessPage, closeSuccessPage] = useToggle(false);

  async function fetchData() {
    try {
      const response = await fetch(apiService);
      const responseData = await response.json();
      setData(responseData);
      onClickStateChange(true);
    } catch (err) {
      logError(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClick = () => {
    setIsLoading(true);
    fetchData();
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
        <p>
          This page allows you to generate API credentials to send to&nbsp;
          your developers so they can work on integration projects.
          If you believe you are seeing this page in error, contact Enterprise Customer Support.
          edX for Business API credentials credentials will provide access&nbsp;
          to the following edX API endpoints: reporting dashboard, dashboard, and catalog administration.
          <br />
          <br />
          By clicking the button below, you and your organization accept the {'\n'}
          <a href="https://courses.edx.org/api-admin/terms-of-service/">edX API terms of service</a>.
        </p>
        <Button
          variant="primary"
          size="lg"
          iconBefore={isLoading ? SpinnerSimple : Add}
          onClick={handleClick}
          block
        >
          {isLoading ? 'Generating...' : 'Generate API Credentials'}
        </Button>
      </Card.Section>
    </Card>
  );
};

ZeroStateCard.propTypes = {
  onClickStateChange: PropTypes.func.isRequired,
};

export default ZeroStateCard;
