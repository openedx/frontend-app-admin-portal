import React from 'react';
import { Dropdown } from '@edx/paragon';

export default function AddUsersDropdown() {
  return (
    <Dropdown className="add-users-dropdown">
      <Dropdown.Button className="btn-primary">
        Add users
      </Dropdown.Button>
      <Dropdown.Menu>
        <Dropdown.Item
          type="button"
          className="btn btn-link"
          // eslint-disable-next-line no-console
          onClick={() => console.log('add individual user modal')}
        >
          With individual email address
        </Dropdown.Item>
        <Dropdown.Item
          type="button"
          className="btn btn-link"
          // eslint-disable-next-line no-console
          onClick={() => console.log('add bulks users modal')}
        >
          Import users from CSV
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
