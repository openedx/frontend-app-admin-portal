import React from 'react';
import { render } from '@testing-library/react';
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
  it('renders the correct values for each engagement statistic', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Stats data={data} isFetching={false} isError={false} title="Engagement" activeTab="engagements" />
      </IntlProvider>,
    );

    expect(container.querySelector('.title-enrollments')?.textContent).toEqual('Enrollments');
    expect(container.querySelector('.value-enrollments')?.textContent).toEqual('150.4K');
    expect(container.querySelector('.title-distinct-courses')?.textContent).toEqual('Distinct Courses');
    expect(container.querySelector('.value-distinct-courses')?.textContent).toEqual('365');
    expect(container.querySelector('.title-daily-sessions')?.textContent).toEqual('Daily Sessions');
    expect(container.querySelector('.value-daily-sessions')?.textContent).toEqual('1892');
    expect(container.querySelector('.title-learning-hours')?.textContent).toEqual('Learning Hours');
    expect(container.querySelector('.value-learning-hours')?.textContent).toEqual('25.35M');
    expect(container.querySelector('.title-completions')?.textContent).toEqual('Completions');
    expect(container.querySelector('.value-completions')?.textContent).toEqual('265.4K');
  });

  it('renders the correct values for each outcomes statistic', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Stats data={data} isFetching={false} isError={false} title="Outcomes" activeTab="outcomes" />
      </IntlProvider>,
    );

    expect(container.querySelector('.title-enrollments')).toBeNull();
    expect(container.querySelector('.title-daily-sessions')).toBeNull();

    expect(container.querySelector('.title-completions')?.textContent).toEqual('Completions');
    expect(container.querySelector('.value-completions')?.textContent).toEqual('265.4K');
    expect(container.querySelector('.title-unique-skills')?.textContent).toEqual('Unique skills gained');
    expect(container.querySelector('.value-unique-skills')?.textContent).toEqual('0');
    expect(container.querySelector('.title-upskilled-learners')?.textContent).toEqual('Upskilled learners');
    expect(container.querySelector('.value-upskilled-learners')?.textContent).toEqual('0');
    expect(container.querySelector('.title-new-skills')?.textContent).toContain('New skills learned in');
    expect(container.querySelector('.value-new-skills')?.textContent).toEqual('0');
  });
});
