import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
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
