import React from 'react';
import renderer from 'react-test-renderer';

import SubsidyRequestManagementTable from '..';

const defaultProps = {
  fetchData: jest.fn(),
  data: [{
    emailAddress: 'test@example.com',
    courseName: 'edX Demonstration Course',
    courseKey: 'edX+DemoX',
    requestDate: '2019-12-03T21:39:24.395101Z',
    requestStatus: 'requested',
  }, {
    emailAddress: 'test@example.com',
    courseName: 'edX Demonstration Course',
    courseKey: 'edX+DemoX',
    requestDate: '2019-12-03T21:39:24.395101Z',
    requestStatus: 'requested',
  }, {
    emailAddress: 'test@example.com',
    courseName: 'edX Demonstration Course',
    courseKey: 'edX+DemoX',
    requestDate: '2019-12-03T21:39:24.395101Z',
    requestStatus: 'declined',
  }],
  requestStatusFilterChoices: [{
    name: 'requested',
    number: 2,
    value: 'requested',
  }, {
    name: 'declined',
    number: 1,
    value: 'declined',
  }],
  onApprove: jest.fn(),
  onDecline: jest.fn(),
};

describe('SubsidyRequestManagementTable', () => {
  test('renders data in a table as expected', () => {
    const tree = renderer
      .create(<SubsidyRequestManagementTable {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
