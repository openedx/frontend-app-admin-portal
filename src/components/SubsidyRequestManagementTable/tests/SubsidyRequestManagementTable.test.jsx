import { IntlProvider } from '@edx/frontend-platform/i18n';
import React from 'react';
import renderer from 'react-test-renderer';

import SubsidyRequestManagementTable from '..';

const defaultProps = {
  fetchData: jest.fn(),
  data: [{
    uuid: 'test-uuid-1',
    email: 'test1@example.com',
    courseTitle: 'edX Demonstration Course 1',
    courseId: 'edX+DemoX1',
    requestDate: '2019-12-03T21:39:24.395101Z',
    requestStatus: 'requested',
  }, {
    uuid: 'test-uuid-2',
    email: 'test2@example.com',
    courseTitle: 'edX Demonstration Course 2',
    courseId: 'edX+DemoX2',
    requestDate: '2020-12-03T21:39:24.395101Z',
    requestStatus: 'requested',
  }, {
    uuid: 'test-uuid-3',
    email: 'test3@example.com',
    courseTitle: 'edX Demonstration Course 3',
    courseId: 'edX+DemoX3',
    requestDate: '2021-12-03T21:39:24.395101Z',
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
  itemCount: 24,
  pageCount: 2,
  isLoading: false,
  initialTableOptions: {
    getRowId: row => row.uuid,
  },
  initialState: {
    pageSize: 20,
    pageIndex: 0,
  },
};

function SubsidyRequestManagementTableWrapper(props) {
  return (
    <IntlProvider locale="en">
      <SubsidyRequestManagementTable {...props} />
    </IntlProvider>
  );
}

describe('SubsidyRequestManagementTable', () => {
  test('renders data in a table as expected', () => {
    const tree = renderer
      .create(<SubsidyRequestManagementTableWrapper {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
