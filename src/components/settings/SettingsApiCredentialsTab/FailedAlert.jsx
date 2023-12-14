import { Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { credentialErrorMessage } from './constants';

const FailedAlert = () => (
  <Alert variant="danger" icon={Error}>
    <Alert.Heading>
      Credential generation failed
    </Alert.Heading>
    <p>
      {credentialErrorMessage}
    </p>
  </Alert>
);

export default FailedAlert;
