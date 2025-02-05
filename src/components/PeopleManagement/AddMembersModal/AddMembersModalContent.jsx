import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import {
  Col, Container, Row, Hyperlink,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import AddMembersModalSummary from './AddMembersModalSummary';
import InviteSummaryCount from '../../learner-credit-management/invite-modal/InviteSummaryCount';
import FileUpload from '../../learner-credit-management/invite-modal/FileUpload';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, isInviteEmailAddressesInputValueValid } from '../../learner-credit-management/cards/data';
import EnterpriseCustomerUserDatatable from '../EnterpriseCustomerUserDatatable';
import { useEnterpriseLearners } from '../../learner-credit-management/data';
import { HELP_CENTER_URL } from '../constants';

const AddMembersModalContent = ({
  onEmailAddressesChange,
  enterpriseUUID,
  groupName,
  enterpriseGroupLearners,
}) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({
    isValidInput: null,
    lowerCasedEmails: [],
    duplicateEmails: [],
    emailsNotInOrg: [],
  });
  const { allEnterpriseLearners } = useEnterpriseLearners({ enterpriseUUID });

  const handleAddMembersBulkAction = useCallback((value) => {
    if (!value) {
      setLearnerEmails([]);
      onEmailAddressesChange([]);
      return;
    }
    setLearnerEmails(prev => [...prev, ...value]);
  }, [onEmailAddressesChange]);

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
      onEmailAddressesChange(learnerEmails, { canInvite: true });
    } else {
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, learnerEmails, allEnterpriseLearners]);

  return (
    <Container size="lg" className="py-3">
      <h3>
        <FormattedMessage
          id="people.management.add.members.section.header"
          defaultMessage="Add new members to your group"
          description="Header for the section to add members to an existing group."
        />
      </h3>
      <Row>
        <Col>
          <FormattedMessage
            id="people.management.add.members.modal"
            defaultMessage="Only members registered with your organization can be added to a group."
            description="Subtitle for the add members modal"
          />
          <Hyperlink
            destination={HELP_CENTER_URL}
            target="_blank"
          >
            Learn more.
          </Hyperlink>
          <h4 className="mt-4 text-uppercase">Group Name</h4>
          <p className="font-weight-bold lead">{groupName}</p>
        </Col>
        <Col />
      </Row>
      <Row>
        <Col>
          <h4 className="mt-2">Select group members</h4>
          <p>
            <FormattedMessage
              id="people.management.page.add.members.csv.upload"
              defaultMessage="Upload a CSV or select members from the table below."
              description="Upload csv section and datatable with members to add to the existing group."
            />
          </p>
          <FileUpload
            memberInviteMetadata={memberInviteMetadata}
            setEmailAddressesInputValue={setEmailAddressesInputValue}
          />
        </Col>
        <Col>
          <h4>Details</h4>
          <AddMembersModalSummary memberInviteMetadata={memberInviteMetadata} />
          <InviteSummaryCount memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
        </Col>
      </Row>
      <EnterpriseCustomerUserDatatable
        onHandleAddMembersBulkAction={handleAddMembersBulkAction}
        onHandleRemoveMembersBulkAction={handleRemoveMembersBulkAction}
        learnerEmails={learnerEmails}
        enterpriseGroupLearners={enterpriseGroupLearners}
      />
    </Container>
  );
};

AddMembersModalContent.propTypes = {
  onEmailAddressesChange: PropTypes.func.isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  groupName: PropTypes.string,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.shape({})),
};

export default AddMembersModalContent;
