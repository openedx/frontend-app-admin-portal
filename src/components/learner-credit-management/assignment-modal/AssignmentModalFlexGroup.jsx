import React from 'react';
import {
  Card, Col, Container, Form, Row, Stack, MenuItem, Menu, SelectMenu, DropdownButton, Dropdown
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

const AssignmentModalFlexGroup = ({ enterpriseFlexGroup }) => {
  const handleOnChange = () => {

  };
  
  const renderFlexGroupSelection = enterpriseFlexGroup.map(flexGroup => {
    return (
      <MenuItem key={flexGroup.name} onChange={()=>{console.log('hello')}}className="group-dropdown mt-2 mb-2 ml-3" as={Form.Checkbox} value={flexGroup.name}>{flexGroup.name} ({flexGroup.acceptedMembersCount})</MenuItem>
    )
  })
  // return (
  //   <Form.Group className="group-dropdown mb-4">
  //     <Form.Control as="select">

  //       <Form.CheckboxSet
  //         name="color-two"
  //         onChange={(e) => console.log(e.target.value)}
  //         defaultValue={['green']}
  //         className="group-dropdown"
  //       >
  //         <Form.Label>Groups</Form.Label>
  //         <SelectMenu className="group-dropdown mt-0" defaultMessage="Select group">
  //           {renderFlexGroupSelection}
  //         </SelectMenu>
  //       </Form.CheckboxSet>
  //     </Form.Control>
  //     {/* <Form.control>
  //       <option>selection 1</option>
  //     </Form.control> */}

  //     <Form.Control.Feedback>
  //       <FormattedMessage
  //         id="lcm.budget.detail.page.catalog.tab.assign.course.section.assign.to.flex.group.help.text"
  //         defaultMessage="Select one or more group to add its members to the assignment."
  //         description="Help text for the flex group drop down menu to add learners from selected group."
  //       />
  //     </Form.Control.Feedback>
  //   </Form.Group>
  // )
  return (
    <Form.Group className='group-dropdown mb-4.5'>
      <Dropdown autoClose="outside" className='group-dropdown'>
        Groups
        <Dropdown.Toggle className='group-dropdown mt-2'>
          Select group
        </Dropdown.Toggle>
        <Dropdown.Menu className='group-dropdown'>
          {renderFlexGroupSelection}
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

export default AssignmentModalFlexGroup;