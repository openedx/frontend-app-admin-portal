import { Form } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { MAX_EMAIL_ENTRY_LIMIT } from '../cards/data';

const InviteModalInputFeedback = ({ memberInviteMetadata, isCsvUpload }) => {
  if (memberInviteMetadata.validationError) {
    if (!memberInviteMetadata.isValidInput) {
      return (
        <Form.Control.Feedback type="invalid">
          {memberInviteMetadata.validationError.message}
        </Form.Control.Feedback>
      );
    }
    if (memberInviteMetadata.emailsNotInOrg.length > 0) {
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
  if (isCsvUpload) {
    return (
      <div>
        {!memberInviteMetadata.lowerCasedEmails.length > 0 ? (
          <Form.Control.Feedback>
            <p className="mb-0">Maximum members at a time: {MAX_EMAIL_ENTRY_LIMIT} emails</p>
          </Form.Control.Feedback>
        ) : null}
      </div>
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
  memberInviteMetadata: PropTypes.shape({
    isValidInput: PropTypes.bool,
    validationError: PropTypes.shape({
      message: PropTypes.number,
    }),
    lowerCasedEmails: PropTypes.arrayOf(
      PropTypes.shape({}),
    ),
    emailsNotInOrg: PropTypes.arrayOf(PropTypes.string),
  }),
  isCsvUpload: PropTypes.bool,
};

export default InviteModalInputFeedback;
