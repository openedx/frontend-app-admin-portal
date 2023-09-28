/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';

export function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Router history={history}>{children}</Router>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

// Search for element by type and inner text
export function findElementWithText(container, type, text) {
  const elements = container.querySelectorAll(type);
  return [...elements].find((elem) => elem.innerHTML.includes(text));
}

export const getButtonElement = (buttonText) => screen.getByRole('button', { name: buttonText });
