import React from 'react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { fireEvent, render, screen } from '@testing-library/react';
import AdminSearchForm from './AdminSearchForm';
import { updateUrl } from '../../utils';
import EVENT_NAMES from '../../eventTracking';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../utils', () => ({
  updateUrl: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const DEFAULT_PROPS = {
  searchEnrollmentsList: () => {},
  searchParams: {},
  tableData: [],
  enterpriseId: 'test-id',
};

const AdminSearchFormWrapper = props => (
  <IntlProvider locale="en">
    <AdminSearchForm {...props} />
  </IntlProvider>
);

describe('<AdminSearchForm />', () => {
  it('displays three filters', async () => {
    render(
      <AdminSearchFormWrapper {...DEFAULT_PROPS} />,
    );
    // confirm that three filter (course, date and search bar) are present
    expect(await screen.findByTestId('form-control-course-filter')).toBeInTheDocument();
    expect(await screen.findByTestId('form-control-date-filter')).toBeInTheDocument();
    expect(await screen.findByTestId('admin-form-search-bar')).toBeInTheDocument();
    expect(await screen.findByTestId('form-control-course-filter')).toHaveTextContent('All Courses');
  });
  [
    { searchQuery: 'foo' },
    { searchCourseQuery: 'bar' },
    { searchDateQuery: '' },
  ].forEach((searchParams) => {
    it(`calls searchEnrollmentsList when ${Object.keys(searchParams)[0]} changes`, () => {
      const spy = jest.fn();
      const props = { ...DEFAULT_PROPS, searchEnrollmentsList: spy };
      const { rerender } = render(
        <AdminSearchFormWrapper {...props} />,
      );
      rerender(<AdminSearchFormWrapper
        {...DEFAULT_PROPS}
        searchEnrollmentsList={spy}
        searchParams={searchParams}
      />);
      // wrapper.setProps({ searchParams });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  it('select the correct budget', () => {
    const budgetUUID = '8d6503dd-e40d-42b8-442b-37dd4c5450e3';
    const budgets = [{
      subsidy_access_policy_uuid: budgetUUID,
      subsidy_access_policy_display_name: 'Everything',
    }];
    const props = {
      ...DEFAULT_PROPS,
      budgets,
      location: { pathname: '/admin/learners' },
    };
    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = container.querySelector('.budgets-dropdown select');

    fireEvent.change(selectElement, { target: { value: budgetUUID } });
    expect(updateUrl).toHaveBeenCalled();
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        budget_uuid: budgetUUID,
        page: 1,
      },
    );
  });

  it('select the correct group', async () => {
    const groupUUID = '7d6503dd-e40d-42b8-442b-37dd4c5450e3';
    const groups = [{
      uuid: groupUUID,
      name: 'Test Group',
    }];
    const props = {
      ...DEFAULT_PROPS,
      groups,
      location: { pathname: '/admin/learners' },
    };
    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = container.querySelector('.groups-dropdown select');
    fireEvent.change(selectElement, { target: { value: groupUUID } });
    expect(updateUrl).toHaveBeenCalled();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-id',
      EVENT_NAMES.LEARNER_PROGRESS_REPORT.FILTER_BY_GROUP_DROPDOWN,
      {
        group: groupUUID,
      },
    );
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        group_uuid: groupUUID,
        page: 1,
      },
    );
  });
});
