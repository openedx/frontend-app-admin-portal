import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Col, Container, Form, Row,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import InviteModalSummary from '../learner-credit-management/invite-modal/InviteModalSummary';
import InviteSummaryCount from '../learner-credit-management/invite-modal/InviteSummaryCount';
import FileUpload from '../learner-credit-management/invite-modal/FileUpload';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, isInviteEmailAddressesInputValueValid } from '../learner-credit-management/cards/data';
import { MAX_LENGTH_GROUP_NAME } from './constants';
import EnterpriseCustomerUserDataTable from './EnterpriseCustomerUserDataTable';
import { useEnterpriseLearners } from '../learner-credit-management/data';

const CreateGroupModalContent = ({
  enterpriseUUID,
  isGroupInvite,
  onEmailAddressesChange,
  onSetGroupName,
  setIsCreateGroupFileUpload,
  setIsCreateGroupListSelection,
}) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({
    isValidInput: null,
    lowerCasedEmails: [],
    duplicateEmails: [],
    emailsNotInOrg: [],
  });
  const [groupNameLength, setGroupNameLength] = useState(0);
  const [groupName, setGroupName] = useState('');
  const { allEnterpriseLearners } = useEnterpriseLearners({ enterpriseUUID });

  const handleGroupNameChange = useCallback((e) => {
    if (!e.target.value) {
      setGroupName('');
      onSetGroupName('');
      return;
    }
    if (e.target.value.length > MAX_LENGTH_GROUP_NAME) {
      return;
    }
    setGroupName(e.target.value);
    setGroupNameLength(e.target.value.length);
    onSetGroupName(e.target.value);
  }, [onSetGroupName]);

  const handleAddMembersBulkAction = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    setLearnerEmails(prev => [...prev, ...value]);
    setIsCreateGroupListSelection(true);
  }, [onEmailAddressesChange, setIsCreateGroupListSelection]);

  const handleRemoveMembersBulkAction = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    setLearnerEmails(prev => prev.filter((el) => !value.includes(el)));
  }, [onEmailAddressesChange]);

  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    // handles csv upload value and formats emails into an array of strings
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
      allEnterpriseLearners,
    });
    setMemberInviteMetadata(inviteMetadata);
    if (inviteMetadata.canInvite) {
      onEmailAddressesChange(inviteMetadata.lowerCasedEmails, { canInvite: true });
    } else {
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, learnerEmails, allEnterpriseLearners]);

  return (
    <Container size="lg" className="py-3">
      <h3>
        <FormattedMessage
          id="people.management.page.create.group.section.header"
          defaultMessage="Create a custom group"
          description="Header for the section to create a new group."
        />
      </h3>
      <Row>
        <Col>
          <h4 className="mt-4">Name your group</h4>
          <Form.Control
            value={groupName}
            onChange={handleGroupNameChange}
            label="name-your-group"
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
          <p>
            <FormattedMessage
              id="people.management.page.create.group.csv.upload"
              defaultMessage="Upload a CSV or select members from the table below."
              description="Upload csv section and datatable with members to add to the new group."
            />
          </p>
          <FileUpload
            memberInviteMetadata={memberInviteMetadata}
            setEmailAddressesInputValue={setEmailAddressesInputValue}
            setIsCreateGroupFileUpload={setIsCreateGroupFileUpload}
          />
        </Col>
        <Col>
          <h4>Details</h4>
          <InviteModalSummary isGroupInvite={isGroupInvite} memberInviteMetadata={memberInviteMetadata} />
          <InviteSummaryCount memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
        </Col>
      </Row>
      <EnterpriseCustomerUserDataTable
        onHandleAddMembersBulkAction={handleAddMembersBulkAction}
        onHandleRemoveMembersBulkAction={handleRemoveMembersBulkAction}
        learnerEmails={learnerEmails}
      />
    </Container>
  );
};

CreateGroupModalContent.propTypes = {
  onEmailAddressesChange: PropTypes.func.isRequired,
  onSetGroupName: PropTypes.func,
  isGroupInvite: PropTypes.bool,
  enterpriseUUID: PropTypes.string.isRequired,
  setIsCreateGroupFileUpload: PropTypes.func,
  setIsCreateGroupListSelection: PropTypes.func,
};

export default CreateGroupModalContent;
