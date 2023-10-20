import React from 'react';
import {
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';

import AssignmentDetailsTableCell from '../AssignmentDetailsTableCell';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'https://enterprise.edx.org' }),
}));
const mockStore = configureMockStore();

const mockInitialState = {
  portalConfiguration: {
    enterpriseSlug: 'testing-company',
  },
};

const props = {
  row: {
    original: {
      uuid: '12345abcde',
      contentKey: 'mba_essentials',
      contentTitle: 'MBA Essentials',
      learnerEmail: 'user@example.com',
    },
  },
}

const AssignmentDetailsTableCellWrapper = ({
  initialStoreState = mockInitialState,
  ...props
}) => (
  <Provider store={mockStore(initialStoreState)}>
    <AssignmentDetailsTableCell {...props} />
  </Provider>
);

describe('<AssignmentDetailsTableCell />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays email', () => {
    const userEmail = 'user@example.com';
    render(<AssignmentDetailsTableCellWrapper {...props}/>);
    expect(screen.getByText(userEmail));
  });

  it('displays content title as hyperlink', () => {
    const contentTitle = 'MBA Essentials';
    render(<AssignmentDetailsTableCellWrapper {...props}/>);
    expect(screen.getByRole('link', {
      name: `${contentTitle} Opens in a new tab`,
    }))
    expect(screen.getByText(contentTitle));
  });

});