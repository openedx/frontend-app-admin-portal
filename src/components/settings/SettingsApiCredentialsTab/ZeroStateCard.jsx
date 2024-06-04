import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Card, Hyperlink, Icon, Spinner,
} from '@openedx/paragon';
import { Add, Error } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { credentialErrorMessage } from './constants';
import cardImage from '../../../data/images/ZeroState.svg';
import { EnterpriseId } from './Context';
import LmsApiService from '../../../data/services/LmsApiService';
import {
  API_CLIENT_DOCUMENTATION, API_TERMS_OF_SERVICE, HELP_CENTER_LINK,
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
        <h2>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.zeroStateCard.noApiCredentials"
            defaultMessage="You do not have API credentials yet."
            description="Header for the zero state card indicating no API credentials"
          />
        </h2>
        { !displayFailureAlert && (
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.zeroStateCard.generateApiCredentialsInfo"
            defaultMessage="This page allows you to generate API credentials to send to your developers so they can work on integration projects. If you believe you are seeing this page in error, <a>contact Enterprise Customer Support.</a>"
            description="Info text explaining the purpose of the page and what to do if there is an error"
            values={{
              // eslint-disable-next-line react/no-unstable-nested-components
              a: (chunks) => (
                <Hyperlink
                  variant="muted"
                  destination={HELP_CENTER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </Hyperlink>
              ),
            }}
          />
        </p>
        )}
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.zeroStateCard.apiAccessInfo"
            defaultMessage="edX for Business API credentials will provide access to the following edX API endpoints: reporting dashboard, dashboard, and catalog administration."
            description="Info text explaining the access provided by the API credentials"
          />
        </p>
        <p>
          <FormattedMessage
            id="adminPortal.settings.apiCredentialsTab.zeroStateCard.acceptTermsInfo"
            defaultMessage="By clicking the button below, you and your organization accept the "
            description="Info text explaining that clicking the button means accepting the terms of service"
          />
          <Hyperlink
            variant="muted"
            destination={API_TERMS_OF_SERVICE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FormattedMessage
              id="adminPortal.settings.apiCredentialsTab.zeroStateCard.termsOfService"
              defaultMessage="edX API terms of service."
              description="Text for the hyperlink to the API terms of service"
            />
          </Hyperlink>
        </p>
      </Card.Section>
      <Card.Footer className={displayFailureAlert ? 'error-footer d-table-row' : ''}>
        { displayFailureAlert && (
          <p className="d-flex small">
            <Icon className="error-icon" src={Error} />
            {credentialErrorMessage}
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
          {isLoading ? (
            <FormattedMessage
              id="adminPortal.settings.apiCredentialsTab.zeroStateCard.generatingLabel"
              defaultMessage="Generating..."
              description="Text indicating that the API credentials are being generated"
            />
          ) : (
            <FormattedMessage
              id="adminPortal.settings.apiCredentialsTab.zeroStateCard.generateApiCredentials"
              defaultMessage="Generate API Credentials"
              description="Button text to generate API credentials"
            />
          )}
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
