import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Col, Container, Form, Row,
} from '@openedx/paragon';

import InviteModalSummary from '../learner-credit-management/invite-modal/InviteModalSummary';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, INPUT_TYPE, isInviteEmailAddressesInputValueValid } from '../learner-credit-management/cards/data';
import FileUpload from '../learner-credit-management/invite-modal/FileUpload';
import { MAX_LENGTH_GROUP_NAME } from './constants';

const CreateGroupModal = ({ onEmailAddressesChange }) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({
    isValidInput: null,
    lowerCasedEmails: [],
    duplicateEmails: null,
  });
  const [groupNameLength, setGroupNameLength] = useState(0);
  const [groupName, setGroupName] = useState('');


  const handleGroupNameChange = (e) => {
    const { value } = e.target;
    if (value.length > MAX_LENGTH_GROUP_NAME) {
      return;
    }
    setGroupNameLength(value.length);
    setGroupName(value);
  };

  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    const emails = value.split('\n').map((email) => email.trim()).filter((email) => email.length > 0);
    console.log(emails)
    setLearnerEmails(emails);
  }, [onEmailAddressesChange]);

  const debouncedHandleEmailAddressesChanged = useMemo(
    () => debounce(handleEmailAddressesChanged, EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY),
    [handleEmailAddressesChanged],
  );

  useEffect(() => {
    debouncedHandleEmailAddressesChanged(emailAddressesInputValue);
  }, [emailAddressesInputValue, debouncedHandleEmailAddressesChanged]);

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
    console.log(inviteMetadata)
  }, [onEmailAddressesChange, learnerEmails]);

  return (
    <Container size="lg" className="py-3">
      <h3>Create a custom group of members</h3>
      <Row>
        <Col>
          <h4 className="mt-4">Name your group</h4>
          <Form.Control
            value={groupName}
            onChange={handleGroupNameChange}
            label="Name"
            data-testid="group-name"
            placeholder="Name"
          />
          <Form.Control.Feedback className="mb-4">
            {groupNameLength} / {MAX_LENGTH_GROUP_NAME}
          </Form.Control.Feedback>
        </Col>
        <Col />
      </Row>
      <Row>
        <Col>
          <h4>Select group members</h4>
          <p>Upload a CSV or select members from the table below.</p>
          <FileUpload
            memberInviteMetadata={memberInviteMetadata}
            setEmailAddressesInputValue={setEmailAddressesInputValue}
          />
        </Col>
        <Col>
          <h4>Details</h4>
          <InviteModalSummary isGroupsInvite memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
        </Col>
      </Row>
    </Container>
  );
};

CreateGroupModal.propTypes = {
  onEmailAddressesChange: PropTypes.func.isRequired,
};

export default CreateGroupModal;
