/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, screen as rtlScreen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';

// TODO: this could likely be replaced by `renderWithRouter` from `@edx/frontend-enterprise-utils`.
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

export const getButtonElement = (buttonText, options = {}) => {
  const {
    screenOverride,
    isQueryByRole,
  } = options;
  const screen = screenOverride || rtlScreen;
  if (isQueryByRole) {
    return screen.queryByRole('button', { name: buttonText });
  }
  return screen.getByRole('button', { name: buttonText });
};

export function queryClient(options = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      ...options,
    },
  });
}
