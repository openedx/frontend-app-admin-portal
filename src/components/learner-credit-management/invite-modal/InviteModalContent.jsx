import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { Col, Container, Form, Row } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import InviteModalSummary from './InviteModalSummary';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, INPUT_TYPE, isInviteEmailAddressesInputValueValid } from '../cards/data';
import FileUpload from './FileUpload';
import InviteModalInputFeedback from './InviteModalInputFeedback';
import InviteModalMembershipInfo from './InviteModalMembershipInfo';
import InviteModalBudgetCard from './InviteModalBudgetCard';
import InviteModalPermissions from './InviteModalPermissions';
import InviteSummaryCount from './InviteSummaryCount';
import MAX_LENGTH_GROUP_NAME from '../../PeopleManagement/constants';
import EnterpriseCustomerUserDatatable from './EnterpriseCustomerUserDatatable';

const InviteModalContent = ({
  onEmailAddressesChange,
  subsidyAccessPolicy,
  isGroupInvite,
  onSetGroupName,
}) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [inputType, setInputType] = useState('email');
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({
    isValidInput: null,
    lowerCasedEmails: [],
    duplicateEmails: [],
  });
  const [groupNameLength, setGroupNameLength] = useState(0);
  const [groupName, setGroupName] = useState('');

  const handleAddMembersBulkAction = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }

    setLearnerEmails(prev => [...prev, ...value])
  }, [])

  const handleRemoveMembersBulkAction = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }

    setLearnerEmails(prev => {
     return prev.filter((el) => !value.includes(el));
    })
  }, [])

  const handleEmailAddressInputChange = (e) => {
    const inputValue = e.target.value;
    setEmailAddressesInputValue(inputValue);
  };

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

  const handleEmailAddressesChanged = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    const emails = value.split('\n').map((email) => email.trim()).filter((email) => email.length > 0);
    setLearnerEmails(prev => [...prev, ...emails]);
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

  if (isGroupInvite) {
    return (
      <Container size="lg" className="py-3">
        <h3>
          <FormattedMessage
            id="people-management.page.create-group.section.header"
            defaultMessage="Create a custom group of members"
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
            <p>Upload a CSV or select members from the table below.</p>
            <FileUpload
              memberInviteMetadata={memberInviteMetadata}
              setEmailAddressesInputValue={setEmailAddressesInputValue}
            />
          </Col>
          <Col>
            <h4>Details</h4>
            <InviteModalSummary isGroupInvite memberInviteMetadata={memberInviteMetadata} />
            <InviteSummaryCount memberInviteMetadata={memberInviteMetadata} />
            <hr className="my-4" />
          </Col>
        </Row>
        <EnterpriseCustomerUserDatatable
          onHandleAddMembersBulkAction={handleAddMembersBulkAction}
          onHandleRemoveMembersBulkAction={handleRemoveMembersBulkAction}
        />
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-3">
      <h3>Invite members to this budget</h3>
      <InviteModalBudgetCard />
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
              <InviteModalInputFeedback memberInviteMetadata={memberInviteMetadata} isCsvUpload={false} />
            </Form.Group>
          )}
          {inputType === INPUT_TYPE.CSV && (
            <FileUpload
              memberInviteMetadata={memberInviteMetadata}
              setEmailAddressesInputValue={setEmailAddressesInputValue}
            />
          )}
          <InviteModalMembershipInfo subsidyAccessPolicy={subsidyAccessPolicy} />
        </Col>
        <Col>
          <h4>Details</h4>
          <InviteModalSummary memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
          <InviteModalPermissions subsidyAccessPolicy={subsidyAccessPolicy} />
        </Col>
      </Row>
    </Container>
  );
};

InviteModalContent.propTypes = {
  onEmailAddressesChange: PropTypes.func.isRequired,
  subsidyAccessPolicy: PropTypes.shape(),
  isGroupInvite: PropTypes.bool.isRequired,
  onSetGroupName: PropTypes.func,
};

export default InviteModalContent;
