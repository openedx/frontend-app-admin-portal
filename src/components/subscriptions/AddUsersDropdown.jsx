import React from 'react';
import { Dropdown } from '@edx/paragon';

export default function AddUsersDropdown() {
  return (
    <Dropdown className="add-users-dropdown">
      <Dropdown.Button className="btn-primary">
        Add users
      </Dropdown.Button>
      <Dropdown.Menu>
        <Dropdown.Item href="https://google.com">
          With individual email address
        </Dropdown.Item>
        <Dropdown.Item href="https://google.com">
          Import users from CSV
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
