import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { BrowserRouter } from 'react-router-dom';
import AdminCards from '../AdminCards';
import NumberCard from '../../NumberCard';

jest.mock('@openedx/paragon/icons', () => ({
  Award: function Award() { return <span data-testid="icon-award" />; },
  Check: function Check() { return <span data-testid="icon-check" />; },
  Groups: function Groups() { return <span data-testid="icon-groups" />; },
  RemoveRedEye: function RemoveRedEye() { return <span data-testid="icon-remove-red-eye" />; },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/admin' }),
}));

const intlProviderProps = {
  locale: 'en',
  messages: {},
};

const defaultProps = {
  activeLearners: {
    past_week: 125,
    past_month: 350,
  },
  numberOfUsers: 500,
  courseCompletions: 75,
  enrolledLearners: 300,
};

const renderComponent = (props = {}) => mount(
  <BrowserRouter>
    <IntlProvider {...intlProviderProps}>
      <AdminCards {...defaultProps} {...props} />
    </IntlProvider>
  </BrowserRouter>,
);

describe('AdminCards', () => {
  it('renders all four cards correctly', () => {
    const wrapper = renderComponent();
    expect(wrapper.find(NumberCard)).toHaveLength(4);
  });

  it('passes the correct title prop to each NumberCard', () => {
    const wrapper = renderComponent();
    const numberCards = wrapper.find(NumberCard);

    expect(numberCards.at(0).prop('title')).toBe(defaultProps.numberOfUsers);
    expect(numberCards.at(1).prop('title')).toBe(defaultProps.enrolledLearners);
    expect(numberCards.at(2).prop('title')).toBe(defaultProps.activeLearners.past_week);
    expect(numberCards.at(3).prop('title')).toBe(defaultProps.courseCompletions);
  });

  it('passes the correct id prop to each NumberCard', () => {
    const wrapper = renderComponent();
    const numberCards = wrapper.find(NumberCard);

    expect(numberCards.at(0).prop('id')).toBe('numberOfUsers');
    expect(numberCards.at(1).prop('id')).toBe('enrolledLearners');
    expect(numberCards.at(2).prop('id')).toBe('activeLearners');
    expect(numberCards.at(3).prop('id')).toBe('courseCompletions');
  });

  it('passes the correct icon prop to each NumberCard', () => {
    const wrapper = renderComponent();
    const numberCards = wrapper.find(NumberCard);

    expect(numberCards.at(0).prop('icon')).toBeDefined();
    expect(numberCards.at(1).prop('icon')).toBeDefined();
    expect(numberCards.at(2).prop('icon')).toBeDefined();
    expect(numberCards.at(3).prop('icon')).toBeDefined();
  });

  it('passes the correct description prop to each NumberCard', () => {
    const wrapper = renderComponent();
    const numberCards = wrapper.find(NumberCard);

    expect(numberCards.at(0).prop('description')).toBeDefined();
    expect(numberCards.at(1).prop('description')).toBeDefined();
    expect(numberCards.at(2).prop('description')).toBeDefined();
    expect(numberCards.at(3).prop('description')).toBeDefined();
  });

  it('passes the correct detailActions prop to each NumberCard', () => {
    const wrapper = renderComponent();
    const numberCards = wrapper.find(NumberCard);

    expect(Array.isArray(numberCards.at(0).prop('detailActions'))).toBe(true);
    expect(numberCards.at(0).prop('detailActions')).toHaveLength(1);

    expect(Array.isArray(numberCards.at(1).prop('detailActions'))).toBe(true);
    expect(numberCards.at(1).prop('detailActions')).toHaveLength(2);

    expect(Array.isArray(numberCards.at(2).prop('detailActions'))).toBe(true);
    expect(numberCards.at(2).prop('detailActions')).toHaveLength(3);

    expect(Array.isArray(numberCards.at(3).prop('detailActions'))).toBe(true);
    expect(numberCards.at(3).prop('detailActions')).toHaveLength(2);
  });

  it('renders correctly with zero values', () => {
    const zeroProps = {
      activeLearners: {
        past_week: 0,
        past_month: 0,
      },
      numberOfUsers: 0,
      courseCompletions: 0,
      enrolledLearners: 0,
    };

    const wrapper = renderComponent(zeroProps);
    const numberCards = wrapper.find(NumberCard);

    expect(numberCards.at(0).prop('title')).toBe(0);
    expect(numberCards.at(1).prop('title')).toBe(0);
    expect(numberCards.at(2).prop('title')).toBe(0);
    expect(numberCards.at(3).prop('title')).toBe(0);
  });
});
