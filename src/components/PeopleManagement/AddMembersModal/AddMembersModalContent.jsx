import {
  useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  Col, Container, Row, Hyperlink,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import AddMembersModalSummary from './AddMembersModalSummary';
import InviteSummaryCount from '../../learner-credit-management/invite-modal/InviteSummaryCount';
import FileUpload from '../../learner-credit-management/invite-modal/FileUpload';
import EnterpriseCustomerUserDataTable from '../EnterpriseCustomerUserDataTable';
import { useEnterpriseLearners } from '../../learner-credit-management/data';
import { HELP_CENTER_URL } from '../constants';
import { removeStringsFromList, splitAndTrim } from '../../../utils';
import { addEmailsAction, initializeEnterpriseEmailsAction } from '../data/actions';
import { useValidatedEmailsContext } from '../data/ValidatedEmailsContext';

const AddMembersModalContent = ({
  enterpriseUUID,
  groupName,
  enterpriseGroupLearners,
}) => {
  const memberInviteMetadata = useValidatedEmailsContext();
  const { dispatch, lowerCasedEmails } = memberInviteMetadata;
  const { allEnterpriseLearners } = useEnterpriseLearners({ enterpriseUUID });

  const handleCsvUpload = useCallback((csv) => {
    let emails = splitAndTrim('\n', csv);
    emails = removeStringsFromList(emails, lowerCasedEmails);
    dispatch(addEmailsAction({ emails, clearErroredEmails: true, actionType: 'UPLOAD_CSV_ACTION' }));
  }, [dispatch, lowerCasedEmails]);

  useEffect(() => {
    const groupEnterpriseLearners = enterpriseGroupLearners.map((learner) => learner?.memberDetails?.userEmail);
    if (allEnterpriseLearners) {
      dispatch(initializeEnterpriseEmailsAction({ allEnterpriseLearners, groupEnterpriseLearners }));
    }
  }, [dispatch, allEnterpriseLearners, enterpriseGroupLearners]);

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
            defaultMessage="Only members registered with your organization can be added to a group. "
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
            setEmailAddressesInputValue={handleCsvUpload}
          />
        </Col>
        <Col>
          <h4>Details</h4>
          <AddMembersModalSummary memberInviteMetadata={memberInviteMetadata} />
          <InviteSummaryCount memberInviteMetadata={memberInviteMetadata} />
          <hr className="my-4" />
        </Col>
      </Row>
      <EnterpriseCustomerUserDataTable />
    </Container>
  );
};

AddMembersModalContent.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  groupName: PropTypes.string,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.shape({})),
};

export default AddMembersModalContent;
