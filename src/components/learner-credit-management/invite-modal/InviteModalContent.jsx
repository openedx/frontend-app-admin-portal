import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Col, Container, Form, Row,
} from '@edx/paragon';

import InviteModalSummary from './InviteModalSummary';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, INPUT_TYPE, isInviteEmailAddressesInputValueValid } from '../cards/data';
import FileUpload from './FileUpload';

const InviteModalContent = ({ onEmailAddressesChange }) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [inputType, setInputType] = useState('email');
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({});

  const handleEmailAddressInputChange = (e) => {
    const inputValue = e.target.value;
    setEmailAddressesInputValue(inputValue);
  };

  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    const emails = value.split('\n').map((email) => email.trim()).filter((email) => email.length > 0);
    setLearnerEmails(emails);
  }, [onEmailAddressesChange]);

  const debouncedHandleEmailAddressesChanged = useMemo(
    () => debounce(handleEmailAddressesChanged, EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY),
    [handleEmailAddressesChanged],
  );

  useEffect(() => {
    debouncedHandleEmailAddressesChanged(emailAddressesInputValue);
  }, [emailAddressesInputValue, debouncedHandleEmailAddressesChanged]);

  // Validate the learner emails emails from user input whenever it changes
  useEffect(() => {
    const inviteMetadata = isInviteEmailAddressesInputValueValid({
      learnerEmails,
    });
    setMemberInviteMetadata(inviteMetadata);
    if (inviteMetadata.canInvite) {
      onEmailAddressesChange(learnerEmails, { canInvite: true });
    } else {
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, learnerEmails]);

  return (
    <Container size="lg" className="py-3">
      <h3>Invite members to this budget</h3>
      <Row className="mt-3">
        <Col>
          <h4 className="mb-4">Send invite to</h4>
          <Form.Group>
            <Form.RadioSet
              name="input-type"
              onChange={(e) => setInputType(e.target.value)}
              defaultValue={INPUT_TYPE.EMAIL}
              isInline
            >
              <Form.Radio className="mr-5" value={INPUT_TYPE.EMAIL}>Enter email addresses</Form.Radio>
              <Form.Radio value={INPUT_TYPE.CSV}>Upload CSV</Form.Radio>
            </Form.RadioSet>
          </Form.Group>
          {inputType === INPUT_TYPE.EMAIL && (
          <Form.Group className="mb-5">
            <Form.Control
              as="textarea"
              value={emailAddressesInputValue}
              onChange={handleEmailAddressInputChange}
              floatingLabel="Member email addresses"
              rows={10}
              data-hj-suppress
            />
            {memberInviteMetadata.validationError ? (
              <Form.Control.Feedback type="invalid">
                {memberInviteMetadata.validationError.message}
              </Form.Control.Feedback>
            ) : (
              <Form.Control.Feedback>
                <p className="mb-0">Maximum invite at a time: 1,000 emails</p>
                <p>To add more than one learner, enter one email address per line.</p>
              </Form.Control.Feedback>
            )}
          </Form.Group>
          )}
          {inputType === INPUT_TYPE.CSV && (
            <FileUpload
              validationError={memberInviteMetadata.validationError}
              setEmailAddressesInputValue={setEmailAddressesInputValue}
            />
          )}
        </Col>
        <Col>
          <h4>Details</h4>
          <InviteModalSummary
            memberInviteMetadata={memberInviteMetadata}
          />
        </Col>
      </Row>
    </Container>
  );
};

InviteModalContent.propTypes = {
  onEmailAddressesChange: PropTypes.func.isRequired,
};

export default InviteModalContent;
