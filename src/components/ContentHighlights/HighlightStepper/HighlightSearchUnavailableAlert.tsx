import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

interface HighlightSearchUnavailableAlertProps {
  className?: string;
}

const HighlightSearchUnavailableAlert: React.FC<HighlightSearchUnavailableAlertProps> = ({ className }) => (
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

HighlightSearchUnavailableAlert.propTypes = {
  className: PropTypes.string,
};

export default HighlightSearchUnavailableAlert;
