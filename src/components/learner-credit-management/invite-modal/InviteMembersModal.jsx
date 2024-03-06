import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { connect } from 'react-redux';

import {
  ActionRow, Button, Col, Container, Form, FullscreenModal, Hyperlink, Row, StatefulButton,
} from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import EVENT_NAMES from '../../../eventTracking';
import { configuration } from '../../../config';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY, isInviteEmailAddressesInputValueValid } from '../cards/data';
import InviteModalSummary from './InviteModalSummary';

const InviteMembersModal = ({ enterpriseId, isOpen, close }) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({});
  const [inviteButtonState, setInviteButtonState] = useState('default');

  const handleCloseInviteModal = () => {
    close();
    setInviteButtonState('default');
  };

  const onEmailAddressesChange = useCallback((
    value,
    { canInvite = false } = {},
  ) => {
    // setLearnerEmails(value);
    setCanInviteMembers(canInvite);
  }, []);

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
    const emails = value.split('\n').filter((email) => email.trim().length > 0);
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
    // setMemberInviteMetadata(inviteMetadata);
    if (inviteMetadata.validationError?.reason) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.INVITE_EMAIL_ADDRESS_VALIDATION,
        { validationErrorReason: inviteMetadata.validationError.reason },
      );
    }
    if (inviteMetadata.canAllocate) {
      onEmailAddressesChange(learnerEmails, { canAllocate: true });
    } else {
      onEmailAddressesChange([]);
    }
  }, [onEmailAddressesChange, learnerEmails, enterpriseId]);

  const handleAllocateContentAssignments = () => {
    setInviteButtonState('pending');
    // on success
    // setInviteButtonState('complete');
    // handleCloseInviteModal();

    // on error
    // setInviteButtonState('error');
  };

  // const fetchEnterpriseCatalogInfo = async () => {
  //   const enterpriseCatalogInfo = await EnterpriseCatalogApiService.fetchEnterpriseCatalog();
    
    
  // };

  return (
    <FullscreenModal
      title="New members"
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Hyperlink
            className="btn btn-tertiary"
            target="_blank"
            destination={configuration.ENTERPRISE_SUPPORT_URL}
          >
            Help Center: Invite Budget Members
          </Hyperlink>
          <ActionRow.Spacer />
          <Button variant="tertiary" onClick={handleCloseInviteModal}>Cancel</Button>
          <StatefulButton
            labels={{
              default: 'Invite',
              pending: 'Inviting...',
              complete: 'Invited',
              error: 'Try again',
            }}
            variant="primary"
            state={inviteButtonState}
            disabled={!canInviteMembers}
            onClick={handleAllocateContentAssignments}
          />
        </ActionRow>
        )}
    >
      <Container size="md">
        <h3>Invite members to this budget</h3>
        <Row className="mt-3">
          <Col>
            <h4>Send invite to</h4>
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
          </Col>
          <Col>
            <h4>Details</h4>
            {/* <InviteModalSummary
              learnerEmails={learnerEmails}
              memberInviteMetadata={memberInviteMetadata}
            /> */}
            <h4>Details</h4>

          </Col>
        </Row>
      </Container>
    </FullscreenModal>
  );
};
InviteMembersModal.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(InviteMembersModal);
