import {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Col, Container, Form, Hyperlink, Row,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import InviteModalSummary from '../learner-credit-management/invite-modal/InviteModalSummary';
import InviteSummaryCount from '../learner-credit-management/invite-modal/InviteSummaryCount';
import FileUpload from '../learner-credit-management/invite-modal/FileUpload';
import { HELP_CENTER_URL, MAX_LENGTH_GROUP_NAME } from './constants';
import EnterpriseCustomerUserDataTable from './EnterpriseCustomerUserDataTable';
import { removeStringsFromListCaseInsensitive, splitAndTrim } from '../../utils';
import { useValidatedEmailsContext } from './data/ValidatedEmailsContext';
import { addEmailsAction, initializeEnterpriseEmailsAction } from './data/actions';

const CreateGroupModalContent = ({
  isGroupInvite,
  onSetGroupName,
}) => {
  const memberInviteMetadata = useValidatedEmailsContext();
  const { dispatch, validatedEmails } = memberInviteMetadata;
  const [groupNameLength, setGroupNameLength] = useState(0);
  const [groupName, setGroupName] = useState('');

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

  const handleCsvUpload = useCallback((csv) => {
    let emails = splitAndTrim('\n', csv);
    emails = removeStringsFromListCaseInsensitive(emails, validatedEmails);
    dispatch(addEmailsAction({ emails, clearErroredEmails: true, actionType: 'UPLOAD_CSV_ACTION' }));
  }, [dispatch, validatedEmails]);

  useEffect(() => {
    // Initialize upon first entry
    dispatch(initializeEnterpriseEmailsAction({}));
  }, [dispatch]);

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
            variant="inline"
            className="ml-1"
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
          />
        </Col>
        <Col>
          <h4>Details</h4>
          <InviteModalSummary isGroupInvite={isGroupInvite} memberInviteMetadata={memberInviteMetadata} />
          <InviteSummaryCount memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
        </Col>
      </Row>
      <EnterpriseCustomerUserDataTable />
    </Container>
  );
};

CreateGroupModalContent.propTypes = {
  onSetGroupName: PropTypes.func,
  isGroupInvite: PropTypes.bool,
};

export default CreateGroupModalContent;
