import React from 'react';
import { mount } from 'enzyme';
import { CourseNameCell, FormattedDateCell } from './CourseSearchResultsCells';
import { configuration } from '../../../config';

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T10:00:00Z';
const testEndDate = '2030-09-10T10:00:00Z';

describe('CourseNameCell', () => {
  const row = {
    original: {
      key: testCourseRunKey,
    },
  };
  const slug = 'sluggy';
  const wrapper = mount(<CourseNameCell value={testCourseName} row={row} enterpriseSlug={slug} />);
  it('correctly formats a link', () => {
    expect(wrapper.find('a').props().href).toEqual(`${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${slug}/course/${row.original.key}`);
  });
  it('displays the course name', () => {
    expect(wrapper.text()).toEqual(testCourseName);
  });
});

describe('<FormattedDateCell />', () => {
  it('renders a formatted date', () => {
    const wrapper = mount(<FormattedDateCell startValue={testStartDate} endValue={testEndDate} />);
    expect(wrapper.text()).toEqual('Sep 10, 2020 - Sep 10, 2030');
  });
});
