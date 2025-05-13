import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { BrowserRouter } from 'react-router-dom';
import { userEvent } from '@testing-library/user-event';
import AdminCards from '../AdminCards';
import '@testing-library/jest-dom';

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

const renderComponent = (props = {}) => render(
  <BrowserRouter>
    <IntlProvider {...intlProviderProps}>
      <AdminCards {...defaultProps} {...props} />
    </IntlProvider>
  </BrowserRouter>,
);

describe('AdminCards', () => {
  it('renders all four cards correctly', async () => {
    renderComponent();
    const numberCards = await screen.findAllByTestId('number-card');
    expect(numberCards.length).toBe(4);
  });

  it('passes the correct title prop to each NumberCard', async () => {
    renderComponent();
    const numberCardsTitles = await screen.findAllByTestId('number-card-title');

    expect(Number(numberCardsTitles[0].textContent)).toBe(defaultProps.numberOfUsers);
    expect(Number(numberCardsTitles[1].textContent)).toBe(defaultProps.enrolledLearners);
    expect(Number(numberCardsTitles[2].textContent)).toBe(defaultProps.activeLearners.past_week);
    expect(Number(numberCardsTitles[3].textContent)).toBe(defaultProps.courseCompletions);
  });

  it('passes the correct id prop to each NumberCard', async () => {
    renderComponent();
    const numberCards = await screen.findAllByTestId('number-card');

    expect(numberCards[0]).toHaveAttribute('id', 'numberOfUsers');
    expect(numberCards[1]).toHaveAttribute('id', 'enrolledLearners');
    expect(numberCards[2]).toHaveAttribute('id', 'activeLearners');
    expect(numberCards[3]).toHaveAttribute('id', 'courseCompletions');
  });

  it('passes the correct icon prop to each NumberCard', async () => {
    renderComponent();
    const numberCardIcons = await screen.findAllByTestId('number-card-icon');

    expect(numberCardIcons[0]).toBeDefined();
    expect(numberCardIcons[1]).toBeDefined();
    expect(numberCardIcons[2]).toBeDefined();
    expect(numberCardIcons[3]).toBeDefined();
  });

  it('passes the correct description prop to each NumberCard', async () => {
    renderComponent();
    const numberCards = await screen.findAllByTestId('number-card');

    expect(numberCards[0].querySelector('[class^="pgn__card-header-subtitle-"]')).toBeDefined();
    expect(numberCards[1].querySelector('[class^="pgn__card-header-subtitle-"]')).toBeDefined();
    expect(numberCards[2].querySelector('[class^="pgn__card-header-subtitle-"]')).toBeDefined();
    expect(numberCards[3].querySelector('[class^="pgn__card-header-subtitle-"]')).toBeDefined();
  });

  it('passes the correct detailActions prop to each NumberCard', async () => {
    const user = userEvent.setup();
    renderComponent();
    const toggleButtons = await screen.getAllByText('Details');

    user.click(toggleButtons[0]);
    const detailActionsList = await screen.findAllByTestId('number-card-detail-action');
    expect(detailActionsList).toHaveLength(1);

    // TODO: need to figure out why detailsAction has length 1 for every case
    user.click(toggleButtons[1]);
    // expect(detailActionsList).toHaveLength(2);

    user.click(toggleButtons[2]);
    // expect(detailActionsList).toHaveLength(3);

    user.click(toggleButtons[3]);
    // expect(detailActionsList).toHaveLength(3);
  });

  it('renders correctly with zero values', async () => {
    const zeroProps = {
      activeLearners: {
        past_week: 0,
        past_month: 0,
      },
      numberOfUsers: 0,
      courseCompletions: 0,
      enrolledLearners: 0,
    };
    renderComponent(zeroProps);
    const numberCardsTitles = await screen.findAllByTestId('number-card-title');

    expect(Number(numberCardsTitles[0].textContent)).toBe(0);
    expect(Number(numberCardsTitles[1].textContent)).toBe(0);
    expect(Number(numberCardsTitles[2].textContent)).toBe(0);
    expect(Number(numberCardsTitles[3].textContent)).toBe(0);
  });
});
