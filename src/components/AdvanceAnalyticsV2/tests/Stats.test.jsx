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
  it('renders the correct values for each statistic', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Stats data={data} isFetching={false} isError={false} />
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
});
