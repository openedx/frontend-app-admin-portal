// TODO: Migrate test to RTL since enzyme is deprecated.
// import { mount } from 'enzyme';
// import { IntlProvider } from '@edx/frontend-platform/i18n';
// import SkillsByLearningHoursChart from './SkillsByLearningHoursChart';
// import ChartWrapper from './ChartWrapper';
//
// jest.mock('./ChartWrapper', () => jest.fn(() => null));
//
// describe('SkillsByLearningHoursChart', () => {
//   const defaultProps = {
//     isFetching: false,
//     isError: false,
//     data: [],
//   };
//
//   const mockData = [
//     { skillName: 'JavaScript', learningHours: 150.5 },
//     { skillName: 'React', learningHours: 120 },
//     { skillName: 'CSS', learningHours: 80.75 },
//   ];
//
//   it('renders when data is provided', () => {
//     const propsWithData = { ...defaultProps, data: mockData };
//     const chartProps = {
//       data: true,
//       labels: ['Learning Hours', 'JavaScript', 'React', 'CSS'],
//       parents: ['', 'Learning Hours', 'Learning Hours', 'Learning Hours'],
//       values: ['', '150.50', '120.00', '80.75'],
//     };
//
//     const wrapper = mount(
//       <IntlProvider locale="en">
//         <SkillsByLearningHoursChart {...propsWithData} />
//       </IntlProvider>,
//     );
//
//     const h2 = wrapper.find('h2');
//     expect(h2.exists()).toBe(true);
//     expect(h2.text()).toBe('Skills by learning hours');
//
//     expect(ChartWrapper).toHaveBeenCalledTimes(1);
//
//     expect(ChartWrapper).toHaveBeenCalledWith(
//       expect.objectContaining({
//         isFetching: propsWithData.isFetching,
//         isError: propsWithData.isError,
//         chartType: 'Treemap',
//         loadingMessage: 'Loading skills by learning hours chart data',
//         chartProps,
//       }),
//       {}, // second arg is context, usually {}
//     );
//   });
// });
