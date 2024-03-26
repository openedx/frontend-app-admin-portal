import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';
import { MAX_EMAIL_ENTRY_LIMIT } from '../cards/data';

const InviteModalInputFeedback = (metadata) => {
  const { memberInviteMetadata } = metadata;
  if (memberInviteMetadata.validationError) {
    if (!memberInviteMetadata.isValidInput) {
      return (
        <Form.Control.Feedback type="invalid">
          {memberInviteMetadata.validationError.message}
        </Form.Control.Feedback>
      );
    }
    return (
      <Form.Control.Feedback className="text-info-500">
        {memberInviteMetadata.validationError.message}
      </Form.Control.Feedback>
    );
  }
  return (
    <Form.Control.Feedback>
      <p className="mb-0">Maximum invite at a time: {MAX_EMAIL_ENTRY_LIMIT} emails</p>
      <p>To add more than one learner, enter one email address per line.</p>
    </Form.Control.Feedback>
  );
};

InviteModalInputFeedback.propTypes = {
  metadata: PropTypes.shape({
    memberInviteMetadata: PropTypes.shape({
      isValidInput: PropTypes.bool,
      validationError: PropTypes.shape({
        message: PropTypes.number,
      }),
    }),
  }),
};

export default InviteModalInputFeedback;
