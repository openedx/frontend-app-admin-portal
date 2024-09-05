import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Stats from '../Stats';

const data = {
  enrolls: 150400,
  courses: 365,
  sessions: 1892,
  hours: 25349876,
  completions: 265400,
};
describe('Stats', () => {
  it('renders the correct values for each statistic', () => {
    const wrapper = mount(
      <IntlProvider locale="en">
        <Stats data={data} isFetching={false} isError={false} />
      </IntlProvider>,
    );

    expect(wrapper.find('.title-enrollments').text()).toEqual('Enrollments');
    expect(wrapper.find('.value-enrollments').text()).toEqual('150.4K');
    expect(wrapper.find('.title-distinct-courses').text()).toEqual('Distinct Courses');
    expect(wrapper.find('.value-distinct-courses').text()).toEqual('365');
    expect(wrapper.find('.title-daily-sessions').text()).toEqual('Daily Sessions');
    expect(wrapper.find('.value-daily-sessions').text()).toEqual('1.89K');
    expect(wrapper.find('.title-learning-hours').text()).toEqual('Learning Hours');
    expect(wrapper.find('.value-learning-hours').text()).toEqual('25.35M');
    expect(wrapper.find('.title-completions').text()).toEqual('Completions');
    expect(wrapper.find('.value-completions').text()).toEqual('265.4K');
  });
});
