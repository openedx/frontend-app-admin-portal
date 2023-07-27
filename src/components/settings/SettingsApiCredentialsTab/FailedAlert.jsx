import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

const FailedAlert = () => (
  <Alert variant="danger" icon={Error}>
    <Alert.Heading>
      Credential generation failed
    </Alert.Heading>
    <p>
      Something went wrong while generating your credentials.
      Please try again.
      If the issue continues, contact Enterprise Customer Support.
    </p>
  </Alert>
);

export default FailedAlert;
