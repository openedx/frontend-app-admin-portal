import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Col, Container, Form, Hyperlink, Row,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import InviteModalSummary from '../learner-credit-management/invite-modal/InviteModalSummary';
import InviteSummaryCount from '../learner-credit-management/invite-modal/InviteSummaryCount';
import FileUpload from '../learner-credit-management/invite-modal/FileUpload';
import { isInviteEmailAddressesInputValueValid, removeInvalidEmailsFromList } from '../learner-credit-management/cards/data';
import { HELP_CENTER_URL, MAX_LENGTH_GROUP_NAME } from './constants';
import EnterpriseCustomerUserDataTable from './EnterpriseCustomerUserDataTable';
import { useEnterpriseLearners } from '../learner-credit-management/data';
import { splitAndTrim } from '../../utils';

const CreateGroupModalContent = ({
  enterpriseUUID,
  isGroupInvite,
  onEmailAddressesChange,
  onSetGroupName,
  setIsCreateGroupFileUpload,
  setIsCreateGroupListSelection,
}) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
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

  const handleCsvUpload = useCallback((emails) => {
    // Remove errored emails from the main list
    const cleanEmails = removeInvalidEmailsFromList(learnerEmails, memberInviteMetadata);
    // Merge new emails with old emails (removing duplicates)
    const allEmails = _.union(cleanEmails, splitAndTrim('\n', emails));
    setLearnerEmails(allEmails);
    setIsCreateGroupFileUpload(true);
  }, [learnerEmails, memberInviteMetadata, setIsCreateGroupFileUpload]);

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
          <FormattedMessage
            id="people.management.create.groups.modal"
            defaultMessage="Only members registered with your organization can be added to a group."
            description="Subtitle for the create group modal"
          />
          <Hyperlink
            destination={HELP_CENTER_URL}
            target="_blank"
          >
            Learn more.
          </Hyperlink>
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
            setEmailAddressesInputValue={handleCsvUpload}
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
