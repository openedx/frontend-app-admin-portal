import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import SkillsByEnrollmentChart from './SkillsByEnrollmentChart';
import '@testing-library/jest-dom';

jest.mock('../data/hooks');

const mockData = [
  {
    count: 313,
    skillName: 'Python (Programming Language)',
    subjectName: 'business-management',
  },
  {
    count: 4460,
    skillName: 'Data Science',
    subjectName: 'business-management',
  },
];

jest.mock('../charts/BarChart', () => {
  const MockedBarChart = () => <div>Mocked BarChart</div>;
  return MockedBarChart;
});

describe('SkillsByEnrollmentChart', () => {
  test('renders static text', () => {
    render(
      <IntlProvider locale="en">
        <SkillsByEnrollmentChart
          isFetching={false}
          isError={false}
          data={mockData}
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Skills by enrollment')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <IntlProvider locale="en">
        <SkillsByEnrollmentChart
          isFetching
          isError={undefined}
          data={undefined}
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Loading top skills by enrollment chart data')).toBeInTheDocument();
  });

  test('renders chart', () => {
    render(
      <IntlProvider locale="en">
        <SkillsByEnrollmentChart
          isFetching={false}
          isError={false}
          data={mockData}
        />
      </IntlProvider>,
    );

    const elements = screen.getAllByText('Mocked BarChart');
    expect(elements).toHaveLength(1);
  });
});
