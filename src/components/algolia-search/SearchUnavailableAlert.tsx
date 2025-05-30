import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

interface SearchUnavailableAlertProps {
  className?: string;
}

const SearchUnavailableAlert: React.FC<SearchUnavailableAlertProps> = ({ className }) => (
  <Alert variant="danger" icon={ErrorIcon} className={className}>
    <Alert.Heading>Search Unavailable</Alert.Heading>
    <p>
      We&apos;re unable to connect to our search service at the moment.
      This means search functionality is currently unavailable.
    </p>
    <span className="font-weight-bold">What you can do:</span>
    <ul>
      <li>Refresh the page to try again.</li>
      <li>Check your network connection.</li>
      <li>If the issue persists, please contact your administrator or our support team.</li>
    </ul>
  </Alert>
);

SearchUnavailableAlert.propTypes = {
  className: PropTypes.string,
};

export default SearchUnavailableAlert;
