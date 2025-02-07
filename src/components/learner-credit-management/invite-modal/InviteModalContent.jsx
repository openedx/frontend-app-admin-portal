import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Form,
  Row,
} from '@openedx/paragon';

import InviteModalSummary from './InviteModalSummary';
import { INPUT_TYPE, isInviteEmailAddressesInputValueValid } from '../cards/data';
import FileUpload from './FileUpload';
import InviteModalInputFeedback from './InviteModalInputFeedback';
import InviteModalMembershipInfo from './InviteModalMembershipInfo';
import InviteModalBudgetCard from './InviteModalBudgetCard';
import InviteModalPermissions from './InviteModalPermissions';
import { GROUP_DROPDOWN_TEXT } from '../../PeopleManagement/constants';
import { useGroupDropdownToggle } from '../data';
import FlexGroupDropdown from '../FlexGroupDropdown';

const InviteModalContent = ({
  onEmailAddressesChange,
  subsidyAccessPolicy,
  onGroupSelectionsChanged,
  enterpriseFlexGroups,
  shouldShowGroupsDropdown,
}) => {
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [inputType, setInputType] = useState('email');
  const [emailAddressesInputValue, setEmailAddressesInputValue] = useState('');
  const [memberInviteMetadata, setMemberInviteMetadata] = useState({
    isValidInput: null,
    lowerCasedEmails: [],
    duplicateEmails: [],
    emailsNotInOrg: [],
  });
  const [groupMemberEmails, setGroupMemberEmails] = useState([]);
  const [checkedGroups, setCheckedGroups] = useState({});
  const [dropdownToggleLabel, setDropdownToggleLabel] = useState(GROUP_DROPDOWN_TEXT);
  const {
    dropdownRef,
    handleCheckedGroupsChanged,
    handleGroupsChanged,
    handleSubmitGroup,
  } = useGroupDropdownToggle({
    checkedGroups,
    dropdownToggleLabel,
    onGroupSelectionsChanged,
    setCheckedGroups,
    setDropdownToggleLabel,
    setGroupMemberEmails,
  });

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

  const handleCsvUpload = (inputValue) => {
    setEmailAddressesInputValue(inputValue);
    handleEmailAddressesChanged(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.code === 'Enter') {
      handleEmailAddressesChanged(emailAddressesInputValue);
    }
  };

  // On non-typing action like mouse moving or tab navigation, perform email validation
  const handleNonTypingAction = () => handleEmailAddressesChanged(emailAddressesInputValue);

  // Validate the learner emails emails from user input whenever it changes
  useEffect(() => {
    const inviteMetadata = isInviteEmailAddressesInputValueValid({
      learnerEmails: [...learnerEmails, ...groupMemberEmails],
    });
    setMemberInviteMetadata(inviteMetadata);
    if (inviteMetadata.canInvite) {
      onEmailAddressesChange(learnerEmails, { canInvite: true });
      onGroupSelectionsChanged(groupMemberEmails, { canInvite: true });
    } else {
      onEmailAddressesChange([]);
      onGroupSelectionsChanged([]);
    }
  }, [onEmailAddressesChange, learnerEmails, groupMemberEmails, onGroupSelectionsChanged]);

  useEffect(() => {
    handleGroupsChanged(checkedGroups);
    const selectedGroups = Object.keys(checkedGroups).filter(group => checkedGroups[group].checked === true);
    if (selectedGroups.length === 1) {
      setDropdownToggleLabel(`${checkedGroups[selectedGroups[0]]?.name} (${checkedGroups[selectedGroups[0]]?.memberEmails.length})`);
    } else if (selectedGroups.length > 1) {
      setDropdownToggleLabel(`${selectedGroups.length} groups selected`);
    } else {
      setDropdownToggleLabel(GROUP_DROPDOWN_TEXT);
    }
  }, [checkedGroups, handleGroupsChanged]);

  return (
    <Container size="lg" className="py-3">
      <h3>Invite members to this budget</h3>
      <InviteModalBudgetCard />
      <Row className="mt-3">
        <Col>
          <h4 className="mb-4">Send invite to</h4>
          <Form.Group className="group-dropdown">
            {shouldShowGroupsDropdown && (
              <FlexGroupDropdown
                checkedGroups={checkedGroups}
                dropdownRef={dropdownRef}
                dropdownToggleLabel={dropdownToggleLabel}
                enterpriseFlexGroups={enterpriseFlexGroups}
                onCheckedGroupsChanged={handleCheckedGroupsChanged}
                onHandleSubmitGroup={handleSubmitGroup}
              />
            )}
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
                onKeyDown={handleKeyPress}
                onBlur={handleNonTypingAction}
                onMouseMove={handleNonTypingAction}
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
              setEmailAddressesInputValue={handleCsvUpload}
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
  onGroupSelectionsChanged: PropTypes.func,
  enterpriseFlexGroups: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    acceptedMembersCount: PropTypes.number,
  })),
  shouldShowGroupsDropdown: PropTypes.bool,
};

export default InviteModalContent;
