import React from 'react';
import {
  Form, MenuItem, Dropdown, Button,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

const InviteModalFlexGroup = ({
  enterpriseFlexGroups,
  onCheckedGroupsChanged,
  checkedGroups,
  onHandleSubmitGroup,
  dropdownToggleLabel,
  dropdownRef,
}) => {
  const renderFlexGroupSelection = enterpriseFlexGroups.map(flexGroup => (
    <MenuItem
      as={Form.Checkbox}
      className="group-dropdown mt-2 mb-2"
      key={flexGroup.uuid}
      onChange={onCheckedGroupsChanged}
      checked={false || [flexGroup.uuid]?.checked}
      value={flexGroup.name}
      id={flexGroup.uuid}
    >
      {flexGroup.name} ({flexGroup.acceptedMembersCount})
    </MenuItem>
  ));

  return (
    <Form.Group className="group-dropdown mb-4.5 pr-1.5">
      <Dropdown ref={dropdownRef} autoClose="outside" className="group-dropdown">
        Groups
        <Dropdown.Toggle variant="outline-primary" id="group-select-toggle" className="group-dropdown mt-2">
          {dropdownToggleLabel}
        </Dropdown.Toggle>
        <Dropdown.Menu className="pl-3 pr-3 group-dropdown">
          {renderFlexGroupSelection}
          <Button className="mt-3 justify-content-center" block onClick={onHandleSubmitGroup}>Apply selections</Button>
        </Dropdown.Menu>
      </Dropdown>
      <Form.Control.Feedback>
        <FormattedMessage
          id="lcm.budget.detail.page.catalog.tab.assign.course.section.assign.to.flex.group.help.text"
          defaultMessage="Select one or more group to add its members to the assignment."
          description="Help text for the flex group drop down menu to add learners from selected group."
        />
      </Form.Control.Feedback>
    </Form.Group>
  );
};

InviteModalFlexGroup.propTypes = {
  checkedGroups: PropTypes.shape({
    id: PropTypes.string,
    memberEmails: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    checked: PropTypes.bool,
  }).isRequired,
  onHandleSubmitGroup: PropTypes.func.isRequired,
  onCheckedGroupsChanged: PropTypes.func.isRequired,
  enterpriseFlexGroups: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    acceptedMembersCount: PropTypes.number,
  })),
  dropdownToggleLabel: PropTypes.string.isRequired,
  dropdownRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

export default InviteModalFlexGroup;